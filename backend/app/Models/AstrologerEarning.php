<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AstrologerEarning extends Model
{
    protected $fillable = [
        'astrologer_id', 'consultation_id',
        'gross_amount', 'platform_fee', 'net_amount', 'status', 'settled_at',
    ];
    protected $casts = [
        'gross_amount'  => 'float',
        'platform_fee'  => 'float',
        'net_amount'    => 'float',
        'settled_at'    => 'datetime',
    ];

    public function astrologer(): BelongsTo   { return $this->belongsTo(Astrologer::class); }
    public function consultation(): BelongsTo { return $this->belongsTo(Consultation::class); }
}
