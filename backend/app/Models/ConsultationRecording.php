<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationRecording extends Model
{
    protected $fillable = [
        'consultation_id', 'filename', 'disk', 'type',
        'size_bytes', 'duration_seconds', 'status',
    ];

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
