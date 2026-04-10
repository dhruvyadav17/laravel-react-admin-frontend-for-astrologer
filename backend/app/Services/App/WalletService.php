<?php
// PATH: app/Services/App/WalletService.php
// Handles: recharge, deduct on consultation, refund, astrologer earnings
// PLATFORM_FEE = 20% — configurable via config/features.php

namespace App\Services\App;

use App\Models\AstrologerEarning;
use App\Models\Consultation;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    /** Platform commission percentage */
    private const PLATFORM_FEE_PERCENT = 20;

    /* ── Get or create wallet ───────────────────── */
    public function getOrCreate(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'total_recharged' => 0, 'total_spent' => 0]
        );
    }

    /* ── Recharge wallet (after payment) ───────── */
    public function recharge(User $user, float $amount, string $reference = ''): Wallet
    {
        return DB::transaction(function () use ($user, $amount, $reference) {
            $wallet = $this->getOrCreate($user);

            $wallet->increment('balance',          $amount);
            $wallet->increment('total_recharged',  $amount);
            $wallet->refresh();

            WalletTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'credit',
                'amount'        => $amount,
                'balance_after' => $wallet->balance,
                'description'   => "Wallet recharged ₹{$amount}",
                'status'        => 'completed',
                'reference'     => $reference,
            ]);

            return $wallet;
        });
    }

    /* ── Deduct for consultation (called on end) ─ */
    public function deductForConsultation(Consultation $consultation): void
    {
        if (!$consultation->total_amount) return;

        DB::transaction(function () use ($consultation) {
            $user   = $consultation->user;
            $wallet = $this->getOrCreate($user);
            $amount = (float) $consultation->total_amount;

            if (!$wallet->hasSufficientBalance($amount)) {
                // Partial deduct — deduct whatever is available
                $amount = $wallet->balance;
            }

            if ($amount <= 0) return;

            $wallet->decrement('balance',      $amount);
            $wallet->increment('total_spent',  $amount);
            $wallet->refresh();

            WalletTransaction::create([
                'user_id'          => $user->id,
                'consultation_id'  => $consultation->id,
                'type'             => 'debit',
                'amount'           => $amount,
                'balance_after'    => $wallet->balance,
                'description'      => "Consultation #{$consultation->id} — {$consultation->duration_minutes} min",
                'status'           => 'completed',
            ]);

            // Astrologer ka earning record
            $gross       = $amount;
            $platformFee = round($gross * self::PLATFORM_FEE_PERCENT / 100, 2);
            $net         = round($gross - $platformFee, 2);

            AstrologerEarning::create([
                'astrologer_id'   => $consultation->astrologer_id,
                'consultation_id' => $consultation->id,
                'gross_amount'    => $gross,
                'platform_fee'    => $platformFee,
                'net_amount'      => $net,
                'status'          => 'pending',
            ]);
        });
    }

    /* ── Refund (if consultation cancelled) ─────── */
    public function refund(Consultation $consultation): void
    {
        $debitTx = WalletTransaction::where('consultation_id', $consultation->id)
            ->where('type', 'debit')
            ->first();

        if (!$debitTx) return;

        DB::transaction(function () use ($consultation, $debitTx) {
            $wallet = $this->getOrCreate($consultation->user);

            $wallet->increment('balance',      $debitTx->amount);
            $wallet->decrement('total_spent',  $debitTx->amount);
            $wallet->refresh();

            WalletTransaction::create([
                'user_id'         => $consultation->user_id,
                'consultation_id' => $consultation->id,
                'type'            => 'refund',
                'amount'          => $debitTx->amount,
                'balance_after'   => $wallet->balance,
                'description'     => "Refund for consultation #{$consultation->id}",
                'status'          => 'completed',
            ]);
        });
    }

    /* ── Get user balance ───────────────────────── */
    public function balance(User $user): float
    {
        return $this->getOrCreate($user)->balance;
    }

    /* ── Astrologer earnings summary ────────────── */
    public function astrologerSummary(int $astrologerId): array
    {
        $earnings = AstrologerEarning::where('astrologer_id', $astrologerId);

        return [
            'total_gross'    => (float) $earnings->sum('gross_amount'),
            'total_net'      => (float) $earnings->sum('net_amount'),
            'pending_payout' => (float) $earnings->where('status', 'pending')->sum('net_amount'),
            'settled'        => (float) $earnings->where('status', 'settled')->sum('net_amount'),
            'total_jobs'     => $earnings->count(),
        ];
    }
}
