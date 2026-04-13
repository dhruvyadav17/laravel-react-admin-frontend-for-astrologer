<?php
// signal_type messages are NOT shown in chat UI (filtered on frontend)

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    protected $fillable = [
        'consultation_id',
        'sender_id',
        'message',
        'signal_type',   // 'offer' | 'answer' | 'ice-candidate' | 'hang-up' | null
        'signal_data',   // JSON WebRTC payload
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read'     => 'boolean',
        'read_at'     => 'datetime',
        'signal_data' => 'array',   // auto JSON decode
    ];

    /* -- Relations ----------------------------- */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /* -- Helpers ------------------------------- */
    public function isSignal(): bool
    {
        return $this->signal_type !== null;
    }

    public function isChat(): bool
    {
        return $this->signal_type === null;
    }
}
