<?php
// PATH: app/Models/ChatMessage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    protected $fillable = ['consultation_id', 'sender_id', 'message', 'is_read', 'read_at'];

    protected $casts = [
        'is_read'  => 'boolean',
        'read_at'  => 'datetime',
    ];

    public function consultation(): BelongsTo { return $this->belongsTo(Consultation::class); }
    public function sender(): BelongsTo        { return $this->belongsTo(User::class, 'sender_id'); }
}