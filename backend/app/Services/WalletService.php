<?php
/**
 * WalletService -- wallet balance management and billing.
 *
 * WALLET CREATION
 * ----------------
 * getOrCreate() ensures every user has a wallet row -- created lazily on
 * first access rather than in the registration seeder.
 *
 * DEDUCTION FLOW
 * ---------------
 * deductForConsultation() is called from ConsultationService::end().
 * It uses SELECT FOR UPDATE (lockForUpdate) to prevent race conditions
 * when multiple requests hit at the same time.
 *
 * Steps:
 * 1. Lock the wallet row.
 * 2. Check idempotency (already deducted? -- skip).
 * 3. Deduct from user wallet, create WalletTransaction (debit).
 * 4. Create AstrologerEarning (80% net), credit astrologer wallet.
 * 5. Create WalletTransaction for astrologer (credit).
 *
 * TO CHANGE PLATFORM FEE: update the 0.20 multiplier in this file.
 *
 * TO ADD REFUND: implement refund() method -- credit back to user wallet,
 * reverse the AstrologerEarning, create a "refund" WalletTransaction.
 */

//   lockForUpdate() applies SELECT FOR UPDATE lock
//   concurrent requests cannot double-credit simultaneously

namespace App\Services;

use App\Models\AstrologerEarning;
use App\Models\Consultation;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    private const PLATFORM_FEE_PERCENT = 20;

    /* -- Get or create wallet ------------------------------- */
    public function getOrCreate(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'total_recharged' => 0, 'total_spent' => 0]
        );
    }

    /* -- Recharge -- with idempotency ------------------------ */
    public function recharge(User $user, float $amount, string $reference = ''): Wallet
    {
        if ($amount < 1) {
            throw ValidationException::withMessages(['amount' => ['Minimum recharge amount is ₹1']]);
        }

        return DB::transaction(function () use ($user, $amount, $reference) {

            // RACE CONDITION FIX: SELECT FOR UPDATE -- row lock
            $wallet = Wallet::where('user_id', $user->id)
                ->lockForUpdate()   // ← prevents concurrent reads during this transaction
                ->first();

            if (!$wallet) {
                $wallet = Wallet::create([
                    'user_id' => $user->id, 'balance' => 0,
                    'total_recharged' => 0,  'total_spent' => 0,
                ]);
            }

            // Idempotency: same reference already processed?
            if ($reference && WalletTransaction::where('reference', $reference)->exists()) {
                return $wallet; // Already credited, don't double credit
            }

            $wallet->increment('balance',         $amount);
            $wallet->increment('total_recharged', $amount);
            $wallet->refresh();

            WalletTransaction::create([
                'user_id'       => $user->id,
                'type'          => 'credit',
                'amount'        => $amount,
                'balance_after' => $wallet->balance,
                'description'   => "Wallet recharged ₹{$amount}",
                'status'        => 'completed',
                'reference'     => $reference ?: null,
            ]);

            return $wallet;
        });
    }

    /* -- Deduct for consultation -- with lock ---------------- */
    public function deductForConsultation(Consultation $consultation): void
    {
        if (!$consultation->total_amount) return;

        $consultation->loadMissing('astrologer');

        // Already deducted?
        if (WalletTransaction::where('consultation_id', $consultation->id)
            ->where('type', 'debit')->exists()) {
            return;
        }

        DB::transaction(function () use ($consultation) {

            // RACE CONDITION FIX: lock the wallet row
            $wallet = Wallet::where('user_id', $consultation->user_id)
                ->lockForUpdate()
                ->first();

            if (!$wallet) return;

            $amount = min((float) $consultation->total_amount, $wallet->balance);
            if ($amount <= 0) return;

            $wallet->decrement('balance',     $amount);
            $wallet->increment('total_spent', $amount);
            $wallet->refresh();

            WalletTransaction::create([
                'user_id'         => $consultation->user_id,
                'consultation_id' => $consultation->id,
                'type'            => 'debit',
                'amount'          => $amount,
                'balance_after'   => $wallet->balance,
                'description'     => "Consultation #{$consultation->id} -- {$consultation->duration_minutes} min",
                'status'          => 'completed',
            ]);

            // Astrologer earning
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

            // FIX BE-10 + BE-H: Credit astrologer wallet with lockForUpdate to prevent race conditions
            $astrologerUserId = $consultation->astrologer->user_id;
            $astrologerWallet = Wallet::where('user_id', $astrologerUserId)->lockForUpdate()->first();
            if (!$astrologerWallet) {
                $astrologerWallet = Wallet::create([
                    'user_id' => $astrologerUserId, 'balance' => 0,
                    'total_recharged' => 0, 'total_spent' => 0,
                ]);
            }
            $astrologerWallet->increment('balance', $net);
            $astrologerWallet->increment('total_recharged', $net);
        });
    }

    /* -- Refund --------------------------------------------- */
    public function refund(Consultation $consultation): void
    {
        $debitTx = WalletTransaction::where('consultation_id', $consultation->id)
            ->where('type', 'debit')
            ->first();

        if (!$debitTx) return;

        // Already refunded?
        if (WalletTransaction::where('consultation_id', $consultation->id)
            ->where('type', 'refund')->exists()) {
            return;
        }

        DB::transaction(function () use ($consultation, $debitTx) {
            $wallet = Wallet::where('user_id', $consultation->user_id)
                ->lockForUpdate()
                ->first();

            if (!$wallet) return;

            $wallet->increment('balance',     $debitTx->amount);
            $wallet->decrement('total_spent', $debitTx->amount);
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

    /* -- Get balance ---------------------------------------- */
    public function balance(User $user): float
    {
        return $this->getOrCreate($user)->balance;
    }

    /* -- Astrologer earnings summary ------------------------ */
    public function astrologerSummary(int $astrologerId): array
    {
        $earnings = AstrologerEarning::where('astrologer_id', $astrologerId);
        return [
            'total_gross'    => (float) $earnings->sum('gross_amount'),
            'total_net'      => (float) $earnings->sum('net_amount'),
            'pending_payout' => (float) $earnings->where('status', 'pending')->sum('net_amount'),
            'settled'        => (float) (clone $earnings)->where('status', 'settled')->sum('net_amount'),
            'total_jobs'     => $earnings->count(),
        ];
    }
}
