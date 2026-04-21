<?php
/**
 * ConsultationService -- all consultation lifecycle business logic.
 *
 * This is the single source of truth for consultation state transitions.
 * Controllers should call methods here rather than touching the model directly.
 *
 * STATE MACHINE
 * --------------
 * pending → accepted → in_progress → completed
 *         ↘ rejected
 * pending → cancelled (by user)
 *
 * BILLING
 * --------
 * Billing happens inside end() via WalletService::deductForConsultation().
 * Rate × max(duration, 1) minutes = total charged.
 * AstrologerEarning is created with 80% of gross. Platform keeps 20%.
 *
 * TO CHANGE PLATFORM FEE: edit the 0.20 constant in WalletService.php.
 *
 * WEBRTC SIGNALING
 * -----------------
 * SDP signals are stored as ChatMessage rows with signal_type set.
 * sendSignal() / getSignals() handle the offer/answer/ICE exchange.
 * See useWebRTC.ts on the frontend for the client-side counterpart.
 *
 * TO ADD A NEW CONSULTATION TYPE (e.g. "live_session"):
 * 1. Add the value to the consultation_type enum in the migration.
 * 2. Handle it in store() validation and isCallType() helper.
 * 3. Add UI support in BookingModal and ConsultationPage.
 */

namespace App\Domains\Consultation\Services;

use App\Enums\ConsultationStatus;
use App\Models\Astrologer;
use App\Models\ChatMessage;
use App\Models\Consultation;
use App\Models\User;
use App\Notifications\ConsultationAccepted;
use App\Notifications\ConsultationCompleted;
use App\Notifications\ConsultationRejected;
use App\Notifications\NewConsultationRequest;
use Illuminate\Support\Str;
use App\Services\WalletService;
use Illuminate\Validation\ValidationException;

class ConsultationService
{
    public function __construct(protected WalletService $walletService) {}

    /* -- Book ------------------------------------- */
    public function book(User $user, Astrologer $astrologer, array $data): Consultation
    {
        if ($astrologer->user_id === $user->id) {
            throw ValidationException::withMessages(['astrologer' => ['You cannot book a consultation with yourself.']]);
        }
        if (!$astrologer->is_verified) {
            throw ValidationException::withMessages(['astrologer' => ['This astrologer is not yet verified.']]);
        }
        if (!$astrologer->is_online || !$astrologer->is_available) {
            throw ValidationException::withMessages(['astrologer' => ['This astrologer is currently offline.']]);
        }

        // FIX BE-G: Validate consultation type against astrologer's setting
        $type = $data['type'] ?? 'chat';
        if ($astrologer->consultation_type !== 'all' && $astrologer->consultation_type !== $type) {
            throw ValidationException::withMessages([
                'type' => ["This astrologer only accepts {$astrologer->consultation_type} consultations."],
            ]);
        }

        $existing = Consultation::where('user_id', $user->id)
            ->where('astrologer_id', $astrologer->id)
            ->whereIn('status', [
                ConsultationStatus::Pending->value,
                ConsultationStatus::Accepted->value,
                ConsultationStatus::InProgress->value,
            ])->first();

        if ($existing) {
            throw ValidationException::withMessages(['consultation' => ['You already have an active consultation with this astrologer.']]);
        }

        $consultation = Consultation::create([
            'user_id'         => $user->id,
            'astrologer_id'   => $astrologer->id,
            'type'            => $type,
            'status'          => ConsultationStatus::Pending->value,
            'rate_per_minute' => $astrologer->price_per_minute,
            'user_note'       => $data['user_note'] ?? null,
            // Pre-generate room_id for call/video types
            'room_id'         => in_array($type, ['call', 'video']) ? 'room_' . Str::random(20) : null,
            'call_status'     => in_array($type, ['call', 'video']) ? 'idle' : null,
        ]);

        $astrologer->user->notify(new NewConsultationRequest($consultation->load(['user', 'astrologer'])));

        return $consultation;
    }

    /* -- Accept ----------------------------------- */
    public function accept(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::Pending);
        $consultation->update(['status' => ConsultationStatus::Accepted->value]);
        $updated = $consultation->fresh(['user', 'astrologer']);
        $updated->user->notify(new ConsultationAccepted($updated));
        return $updated;
    }

    /* -- Reject ----------------------------------- */
    public function reject(Consultation $consultation, string $reason = ''): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::Pending);
        $consultation->update([
            'status'           => ConsultationStatus::Rejected->value,
            'rejection_reason' => $reason ?: 'Astrologer is not available right now.',
        ]);
        $updated = $consultation->fresh(['user', 'astrologer']);
        $updated->user->notify(new ConsultationRejected($updated));
        return $updated;
    }

    /* -- Start ------------------------------------ */
    public function start(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::Accepted);
        $consultation->update([
            'status'      => ConsultationStatus::InProgress->value,
            'started_at'  => now(),
            // For call/video: set to ringing so user knows call is starting
            'call_status' => $consultation->isCallType() ? 'ringing' : null,
        ]);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* -- End + billing ---------------------------- */
    public function end(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::InProgress);

        $endedAt  = now();
        $duration = (int) $consultation->started_at->diffInMinutes($endedAt);
        $total    = round($consultation->rate_per_minute * max($duration, 1), 2);

        $consultation->update([
            'status'           => ConsultationStatus::Completed->value,
            'ended_at'         => $endedAt,
            'duration_minutes' => max($duration, 1),
            'total_amount'     => $total,
            'call_status'      => $consultation->isCallType() ? 'ended' : null,
        ]);

        $consultation->astrologer->increment('total_consultations');
        $updated = $consultation->fresh(['user', 'astrologer']);

        $this->walletService->deductForConsultation($updated);
        $updated->user->notify(new ConsultationCompleted($updated));

        return $updated;
    }

    /* -- Cancel ----------------------------------- */
    public function cancel(Consultation $consultation, User $user): Consultation
    {
        if ($consultation->user_id !== $user->id) {
            throw ValidationException::withMessages(['consultation' => ['Unauthorized.']]);
        }
        $this->assertStatus($consultation, ConsultationStatus::Pending);
        $consultation->update(['status' => ConsultationStatus::Cancelled->value]);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* -- Send chat message ------------------------ */
    public function sendMessage(Consultation $consultation, User $sender, string $message): ChatMessage
    {
        $status = ConsultationStatus::from($consultation->status);
        if (!$status->allowsChat()) {
            throw ValidationException::withMessages(['message' => ['Cannot send messages for this consultation.']]);
        }
        return ChatMessage::create([
            'consultation_id' => $consultation->id,
            'sender_id'       => $sender->id,
            'message'         => $message,
        ]);
    }

    /* -- Send WebRTC signal ----------------------- */
    // offer, answer, ice-candidate, hang-up travel via this
    public function sendSignal(
        Consultation $consultation,
        User $sender,
        string $signalType,
        mixed $signalData
    ): ChatMessage {
        return ChatMessage::create([
            'consultation_id' => $consultation->id,
            'sender_id'       => $sender->id,
            'message'         => '', // empty -- not a chat message
            'signal_type'     => $signalType,
            'signal_data'     => $signalData,
        ]);
    }

    /* -- Get WebRTC signals (poll) ---------------- */
    // Frontend polls this every 1s during call setup
    // FIX: Use !is_null($afterId) instead of when($afterId) because 0 is falsy in PHP
    public function getSignals(Consultation $consultation, User $receiver, ?int $afterId = null)
    {
        return $consultation->messages()
            ->with('sender:id,name')
            ->whereNotNull('signal_type')                   // only signal messages
            ->where('sender_id', '!=', $receiver->id)      // from other side
            ->when(!is_null($afterId), fn($q) => $q->where('id', '>', $afterId))
            ->orderBy('id')
            ->limit(20)
            ->get();
    }

    /* -- Update call status ----------------------- */
    public function updateCallStatus(Consultation $consultation, string $status): Consultation
    {
        $consultation->update(['call_status' => $status]);
        return $consultation->fresh();
    }

    /* -- Get messages (chat only) ----------------- */
    public function messages(Consultation $consultation)
    {
        return $consultation->messages()
            ->with('sender:id,name,profile_image')
            ->whereNull('signal_type') // exclude WebRTC signals from chat
            ->orderBy('created_at')
            ->get();
    }

    /* -- Mark read -------------------------------- */
    public function markRead(Consultation $consultation, User $reader): void
    {
        $consultation->messages()
            ->where('sender_id', '!=', $reader->id)
            ->where('is_read', false)
            ->whereNull('signal_type')
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    /* -- Lists ------------------------------------ */
    public function userList(User $user, ?string $status = null)
    {
        return Consultation::with(['astrologer.user'])
            ->where('user_id', $user->id)
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()->paginate(10);
    }

    public function astrologerList(Astrologer $astrologer, ?string $status = null)
    {
        return Consultation::with(['user'])
            ->where('astrologer_id', $astrologer->id)
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()->paginate(10);
    }

    /* -- Assert status ---------------------------- */
    private function assertStatus(Consultation $c, ConsultationStatus $expected): void
    {
        if ($c->status !== $expected->value) {
            throw ValidationException::withMessages([
                'status' => ["Expected '{$expected->label()}', got '{$c->status}'."],
            ]);
        }
    }
}
