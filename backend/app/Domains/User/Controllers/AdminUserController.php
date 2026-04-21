<?php

namespace App\Domains\User\Controllers;
use App\Http\Controllers\Controller;
use App\Domains\User\Requests\UserRequest;
use App\Domains\User\Services\UserService;

class AdminUserController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    public function store(UserRequest $request)
    {
        $result = $this->service->createAdmin(
            $request->validated()
        );

        return $this->success(
            'Admin created successfully',
            [
                'email'    => $result['user']->email,
                'password' => $result['password'], // show once
            ],
            [],
            201
        );
    }

    /**
     * POST /admin/users/{user}/wallet-credit
     * Admin credits a user's wallet manually.
     */
    public function walletCredit(Request $request, \App\Models\User $user): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:100000'],
            'note'   => ['sometimes', 'string', 'max:200'],
        ]);

        $walletService = app(WalletService::class);
        $wallet = $walletService->recharge(
            $user,
            (float) $data['amount'],
            'ADMIN-' . strtoupper(uniqid())
        );

        // Log to audit
        \Illuminate\Support\Facades\Log::info('Admin wallet credit', [
            'admin_id' => $request->user()->id,
            'user_id'  => $user->id,
            'amount'   => $data['amount'],
            'note'     => $data['note'] ?? null,
        ]);

        return $this->success("Credited ₹{$data['amount']} to {$user->name}'s wallet", [
            'balance' => $wallet->balance,
        ]);
    }

}
