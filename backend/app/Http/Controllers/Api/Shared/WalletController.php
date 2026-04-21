<?php
// User wallet: balance, recharge, transaction history
// GET  /api/v1/wallet          -- balance + summary
// POST /api/v1/wallet/recharge -- add money (demo -- no payment gateway)
// GET  /api/v1/wallet/transactions -- history

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use App\Support\Pagination;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(protected WalletService $walletService) {}

    /* -- GET: Balance + summary ------------------- */
    public function show(Request $request): JsonResponse
    {
        $user   = $request->user();
        $wallet = $this->walletService->getOrCreate($user);

        return $this->success('Wallet fetched', [
            'balance'         => $wallet->balance,
            'total_recharged' => $wallet->total_recharged,
            'total_spent'     => $wallet->total_spent,
        ]);
    }

    /* -- POST: Recharge (demo -- no real payment) - */
    public function recharge(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:50', 'max:50000'],
        ]);

        $wallet = $this->walletService->recharge(
            $request->user(),
            (float) $data['amount'],
            'DEMO-' . strtoupper(uniqid())
        );

        return $this->success('Wallet recharged successfully', [
            'balance' => $wallet->balance,
            'added'   => $data['amount'],
        ], [], 201);
    }

    /* -- GET: Transaction history ----------------- */
    public function transactions(Request $request): JsonResponse
    {
        $paginator = WalletTransaction::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return $this->success('Transactions fetched',
            $paginator->map(fn ($t) => [
                'id'             => $t->id,
                'type'           => $t->type,
                'amount'         => $t->amount,
                'balance_after'  => $t->balance_after,
                'description'    => $t->description,
                'status'         => $t->status,
                'created_at'     => $t->created_at->diffForHumans(),
            ]),
            ['pagination' => Pagination::meta($paginator)]
        );
    }
}
