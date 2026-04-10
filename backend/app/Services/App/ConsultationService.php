<?php
// PATH: app/Services/App/ConsultationService.php
// IMPROVED: Notifications auto-fire on state transitions
// IMPROVED: WalletService deducts on end()
// IMPROVED: PHP Enums for all status values

namespace App\Services\App;

use App\Enums\ConsultationStatus;
use App\Models\Astrologer;
use App\Models\ChatMessage;
use App\Models\Consultation;
use App\Models\User;
use App\Notifications\ConsultationAccepted;
use App\Notifications\ConsultationCompleted;
use App\Notifications\ConsultationRejected;
use App\Notifications\NewConsultationRequest;
use Illuminate\Validation\ValidationException;

class ConsultationService
{
    public function __construct(protected WalletService $walletService) {}

    /* ── Book ───────────────────────────────────── */
    public function book(User $user, Astrologer $astrologer, array $data): Consultation
    {
        if ($astrologer->user_id === $user->id) {
            throw ValidationException::withMessages([
                'astrologer' => ['Aap apne aap ko book nahi kar sakte.'],
            ]);
        }
        if (!$astrologer->is_verified) {
            throw ValidationException::withMessages([
                'astrologer' => ['Yeh astrologer abhi verified nahi hai.'],
            ]);
        }
        if (!$astrologer->is_online || !$astrologer->is_available) {
            throw ValidationException::withMessages([
                'astrologer' => ['Astrologer abhi online nahi hai.'],
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
            throw ValidationException::withMessages([
                'consultation' => ['Pehle se ek active request hai.'],
            ]);
        }

        $consultation = Consultation::create([
            'user_id'         => $user->id,
            'astrologer_id'   => $astrologer->id,
            'type'            => $data['type'] ?? 'chat',
            'status'          => ConsultationStatus::Pending->value,
            'rate_per_minute' => $astrologer->price_per_minute,
            'user_note'       => $data['user_note'] ?? null,
        ]);

        // Notify astrologer — new request
        $astrologer->user->notify(new NewConsultationRequest($consultation->load(['user', 'astrologer'])));

        return $consultation;
    }

    /* ── Accept ─────────────────────────────────── */
    public function accept(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::Pending);
        $consultation->update(['status' => ConsultationStatus::Accepted->value]);
        $updated = $consultation->fresh(['user', 'astrologer']);

        // Notify user
        $updated->user->notify(new ConsultationAccepted($updated));

        return $updated;
    }

    /* ── Reject ─────────────────────────────────── */
    public function reject(Consultation $consultation, string $reason = ''): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::Pending);
        $consultation->update([
            'status'           => ConsultationStatus::Rejected->value,
            'rejection_reason' => $reason ?: 'Astrologer is not available right now.',
        ]);
        $updated = $consultation->fresh(['user', 'astrologer']);

        // Notify user
        $updated->user->notify(new ConsultationRejected($updated));

        return $updated;
    }

    /* ── Start ──────────────────────────────────── */
    public function start(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, ConsultationStatus::Accepted);
        $consultation->update([
            'status'     => ConsultationStatus::InProgress->value,
            'started_at' => now(),
        ]);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── End + billing ──────────────────────────── */
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
        ]);

        $consultation->astrologer->increment('total_consultations');

        $updated = $consultation->fresh(['user', 'astrologer']);

        // Wallet deduction + astrologer earning
        $this->walletService->deductForConsultation($updated);

        // Notify user
        $updated->user->notify(new ConsultationCompleted($updated));

        return $updated;
    }

    /* ── Cancel ─────────────────────────────────── */
    public function cancel(Consultation $consultation, User $user): Consultation
    {
        if ($consultation->user_id !== $user->id) {
            throw ValidationException::withMessages(['consultation' => ['Unauthorized.']]);
        }
        $this->assertStatus($consultation, ConsultationStatus::Pending);
        $consultation->update(['status' => ConsultationStatus::Cancelled->value]);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── Send message ───────────────────────────── */
    public function sendMessage(Consultation $consultation, User $sender, string $message): ChatMessage
    {
        $status = ConsultationStatus::from($consultation->status);
        if (!$status->allowsChat()) {
            throw ValidationException::withMessages([
                'message' => ['Is consultation mein message nahi bhej sakte.'],
            ]);
        }
        return ChatMessage::create([
            'consultation_id' => $consultation->id,
            'sender_id'       => $sender->id,
            'message'         => $message,
        ]);
    }

    /* ── Get messages ───────────────────────────── */
    public function messages(Consultation $consultation)
    {
        return $consultation->messages()
            ->with('sender:id,name,profile_image')
            ->orderBy('created_at')
            ->get();
    }

    /* ── Mark read ──────────────────────────────── */
    public function markRead(Consultation $consultation, User $reader): void
    {
        $consultation->messages()
            ->where('sender_id', '!=', $reader->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    /* ── Lists ──────────────────────────────────── */
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

    /* ── Assert status ──────────────────────────── */
    private function assertStatus(Consultation $c, ConsultationStatus $expected): void
    {
        if ($c->status !== $expected->value) {
            throw ValidationException::withMessages([
                'status' => ["Expected '{$expected->label()}', got '{$c->status}'."],
            ]);
        }
    }
}
