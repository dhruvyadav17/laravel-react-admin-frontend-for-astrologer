<?php
// PATH: app/Models/WalletTransaction.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    protected $fillable = [
        'user_id', 'consultation_id', 'type',
        'amount', 'balance_after', 'description', 'status', 'reference',
    ];
    protected $casts = ['amount' => 'float', 'balance_after' => 'float'];

    public function user(): BelongsTo         { return $this->belongsTo(User::class); }
    public function consultation(): BelongsTo { return $this->belongsTo(Consultation::class); }
}
