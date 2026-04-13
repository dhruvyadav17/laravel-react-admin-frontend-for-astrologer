<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $fillable = ['user_id', 'balance', 'total_recharged', 'total_spent'];
    protected $casts    = ['balance' => 'float', 'total_recharged' => 'float', 'total_spent' => 'float'];

    public function user(): BelongsTo        { return $this->belongsTo(User::class); }
    public function transactions(): HasMany  { return $this->hasMany(WalletTransaction::class, 'user_id', 'user_id'); }

    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }
}
