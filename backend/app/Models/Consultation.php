<?php
// PATH: app/Models/Consultation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    protected $fillable = [
        'user_id', 'astrologer_id', 'type', 'status',
        'started_at', 'ended_at', 'duration_minutes',
        'rate_per_minute', 'total_amount',
        'user_note', 'rejection_reason',
    ];

    protected $casts = [
        'started_at'       => 'datetime',
        'ended_at'         => 'datetime',
        'rate_per_minute'  => 'float',
        'total_amount'     => 'float',
    ];

    /* ── Relations ──────────────────────────────── */
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

    /* ── Helpers ────────────────────────────────── */
    public function isPending(): bool    { return $this->status === 'pending';     }
    public function isActive(): bool     { return $this->status === 'in_progress'; }
    public function isCompleted(): bool  { return $this->status === 'completed';   }

    public function calculateTotal(): float
    {
        if (!$this->duration_minutes) return 0;
        return round($this->rate_per_minute * $this->duration_minutes, 2);
    }

    /* ── Scopes ─────────────────────────────────── */
    public function scopePending($q)    { return $q->where('status', 'pending');     }
    public function scopeActive($q)     { return $q->where('status', 'in_progress'); }
    public function scopeCompleted($q)  { return $q->where('status', 'completed');   }
}