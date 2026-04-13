<?php
/**
 * Consultation -- the core model for a single session between user and astrologer.
 *
 * KEY FIELDS
 * -----------
 * type          -- "chat" | "call" | "video"
 * status        -- "pending" → "accepted" → "in_progress" → "completed" | "rejected" | "cancelled"
 * rate_per_minute -- snapshot of astrologer rate at booking time (frozen)
 * total_amount  -- set on completion: rate_per_minute × duration_minutes
 * room_id       -- random string for call/video types (unused for chat)
 * call_status   -- "idle" | "ringing" | "active" | "ended" (call/video only)
 *
 * RELATIONS
 * ----------
 * user()       -- BelongsTo User
 * astrologer() -- BelongsTo Astrologer
 * messages()   -- HasMany ChatMessage (includes WebRTC signals)
 *
 * HELPER METHODS
 * ---------------
 * isPending() / isActive() / isCompleted() -- status boolean helpers
 * isCallType() -- true for call and video types
 * calculateTotal() -- rate × duration (used for billing preview)
 * generateRoomId() -- returns "room_" + 20 random chars
 *
 * TO ADD A NEW STATUS: add it to ConsultationStatus enum + update the
 * state machine in ConsultationService.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Consultation extends Model
{
    protected $fillable = [
        'user_id', 'astrologer_id', 'type', 'status',
        'started_at', 'ended_at', 'duration_minutes',
        'rate_per_minute', 'total_amount',
        'user_note', 'rejection_reason',
        'room_id', 'call_status',
    ];

    protected $casts = [
        'started_at'      => 'datetime',
        'ended_at'        => 'datetime',
        'rate_per_minute' => 'float',
        'total_amount'    => 'float',
    ];

    /* -- Relations ----------------------------- */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function astrologer(): BelongsTo
    {
        return $this->belongsTo(Astrologer::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /* -- Helpers ------------------------------- */
    public function isPending(): bool    { return $this->status === 'pending';     }
    public function isActive(): bool     { return $this->status === 'in_progress'; }
    public function isCompleted(): bool  { return $this->status === 'completed';   }
    public function isCallType(): bool   { return in_array($this->type, ['call', 'video']); }
    public function isChatType(): bool   { return $this->type === 'chat'; }

    public function calculateTotal(): float
    {
        if (!$this->duration_minutes) return 0;
        return round($this->rate_per_minute * $this->duration_minutes, 2);
    }

    /* -- Generate unique room ID --------------- */
    public function generateRoomId(): string
    {
        return 'room_' . Str::random(16);
    }

    /* -- Scopes -------------------------------- */
    public function scopePending($q)   { return $q->where('status', 'pending');     }
    public function scopeActive($q)    { return $q->where('status', 'in_progress'); }
    public function scopeCompleted($q) { return $q->where('status', 'completed');   }
}
