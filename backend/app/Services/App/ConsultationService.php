<?php
// PATH: app/Services/App/ConsultationService.php
// Handles: book, accept, reject, start, end, message

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\ChatMessage;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConsultationService
{
    /* ── User: Book a consultation ──────────────── */
    public function book(User $user, Astrologer $astrologer, array $data): Consultation
    {
        // Can't book yourself
        if ($astrologer->user_id === $user->id) {
            throw ValidationException::withMessages([
                'astrologer' => ['Aap apne aap ko book nahi kar sakte.'],
            ]);
        }

        // Astrologer must be verified
        if (!$astrologer->is_verified) {
            throw ValidationException::withMessages([
                'astrologer' => ['Yeh astrologer abhi verified nahi hai.'],
            ]);
        }

        // Astrologer must be online and available
        if (!$astrologer->is_online || !$astrologer->is_available) {
            throw ValidationException::withMessages([
                'astrologer' => ['Astrologer abhi online nahi hai. Baad mein try karein.'],
            ]);
        }

        // Check no active/pending consultation already exists with this astrologer
        $existing = Consultation::where('user_id', $user->id)
            ->where('astrologer_id', $astrologer->id)
            ->whereIn('status', ['pending', 'accepted', 'in_progress'])
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'consultation' => ['Aapki is astrologer ke saath pehle se ek active request hai.'],
            ]);
        }

        return Consultation::create([
            'user_id'        => $user->id,
            'astrologer_id'  => $astrologer->id,
            'type'           => $data['type'] ?? 'chat',
            'status'         => 'pending',
            'rate_per_minute'=> $astrologer->price_per_minute,
            'user_note'      => $data['user_note'] ?? null,
        ]);
    }

    /* ── Astrologer: Accept ─────────────────────── */
    public function accept(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, 'pending');
        $consultation->update(['status' => 'accepted']);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── Astrologer: Reject ─────────────────────── */
    public function reject(Consultation $consultation, string $reason = ''): Consultation
    {
        $this->assertStatus($consultation, 'pending');
        $consultation->update([
            'status'           => 'rejected',
            'rejection_reason' => $reason ?: 'Astrologer is not available right now.',
        ]);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── Astrologer/User: Start session ─────────── */
    public function start(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, 'accepted');
        $consultation->update([
            'status'     => 'in_progress',
            'started_at' => now(),
        ]);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── End consultation & calculate bill ──────── */
    public function end(Consultation $consultation): Consultation
    {
        $this->assertStatus($consultation, 'in_progress');

        $endedAt  = now();
        $duration = (int) $consultation->started_at->diffInMinutes($endedAt);
        $total    = round($consultation->rate_per_minute * max($duration, 1), 2);

        $consultation->update([
            'status'           => 'completed',
            'ended_at'         => $endedAt,
            'duration_minutes' => max($duration, 1),
            'total_amount'     => $total,
        ]);

        // Update astrologer total_consultations
        $consultation->astrologer->increment('total_consultations');

        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── User: Cancel pending request ──────────── */
    public function cancel(Consultation $consultation, User $user): Consultation
    {
        if ($consultation->user_id !== $user->id) {
            throw ValidationException::withMessages(['consultation' => ['Unauthorized.']]);
        }
        $this->assertStatus($consultation, 'pending');
        $consultation->update(['status' => 'cancelled']);
        return $consultation->fresh(['user', 'astrologer']);
    }

    /* ── Send chat message ──────────────────────── */
    public function sendMessage(Consultation $consultation, User $sender, string $message): ChatMessage
    {
        if (!in_array($consultation->status, ['accepted', 'in_progress'])) {
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
    public function messages(Consultation $consultation): \Illuminate\Database\Eloquent\Collection
    {
        return $consultation->messages()
            ->with('sender:id,name,profile_image')
            ->orderBy('created_at')
            ->get();
    }

    /* ── Mark messages as read ──────────────────── */
    public function markRead(Consultation $consultation, User $reader): void
    {
        $consultation->messages()
            ->where('sender_id', '!=', $reader->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    /* ── Paginated list for user ────────────────── */
    public function userList(User $user, ?string $status = null)
    {
        return Consultation::with(['astrologer'])
            ->where('user_id', $user->id)
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(10);
    }

    /* ── Paginated list for astrologer ─────────── */
    public function astrologerList(Astrologer $astrologer, ?string $status = null)
    {
        return Consultation::with(['user'])
            ->where('astrologer_id', $astrologer->id)
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(10);
    }

    /* ── Assert status ──────────────────────────── */
    private function assertStatus(Consultation $c, string $expected): void
    {
        if ($c->status !== $expected) {
            throw ValidationException::withMessages([
                'status' => ["Expected status '{$expected}', got '{$c->status}'."],
            ]);
        }
    }
}