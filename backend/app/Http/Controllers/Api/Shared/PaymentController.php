<?php
/**
 * PaymentController — Razorpay payment gateway integration.
 *
 * FLOW:
 * 1. User selects amount → POST /payment/create-order
 *    → Creates Razorpay order, returns order_id to frontend
 * 2. Frontend opens Razorpay checkout with order_id
 * 3. User pays → Razorpay sends payment_id, signature to frontend
 * 4. Frontend sends to POST /payment/verify
 *    → Backend verifies HMAC signature
 *    → On success: credits wallet
 *
 * SETUP (one time):
 * 1. Sign up at razorpay.com → get test API keys
 * 2. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
 * 3. composer require razorpay/razorpay
 *
 * TEST CARDS (Razorpay test mode):
 *   Card: 4111 1111 1111 1111  CVV: any  Expiry: any future date
 *   UPI:  success@razorpay
 */

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(protected WalletService $walletService) {}

    /**
     * POST /payment/create-order
     * Creates a Razorpay order for the given amount.
     */
    public function createOrder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:50', 'max:50000'],
        ]);

        $amountPaise = (int) round($data['amount'] * 100); // Razorpay uses paise

        $keyId     = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');

        // If Razorpay keys not configured, use demo mode
        if (empty($keyId) || str_starts_with($keyId, 'rzp_test_YOUR')) {
            return $this->success('Demo order created (configure Razorpay keys for real payments)', [
                'order_id'   => 'demo_order_' . uniqid(),
                'amount'     => $amountPaise,
                'currency'   => 'INR',
                'key_id'     => null,
                'demo_mode'  => true,
            ]);
        }

        try {
            // Create Razorpay order via API
            $ch = curl_init('https://api.razorpay.com/v1/orders');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_USERPWD        => "{$keyId}:{$keySecret}",
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                CURLOPT_POSTFIELDS     => json_encode([
                    'amount'          => $amountPaise,
                    'currency'        => 'INR',
                    'receipt'         => 'wallet_' . $request->user()->id . '_' . time(),
                    'notes'           => ['user_id' => $request->user()->id],
                ]),
            ]);

            $response = json_decode(curl_exec($ch), true);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200 || empty($response['id'])) {
                Log::error('Razorpay order creation failed', $response ?? []);
                return $this->error('Payment gateway error. Please try again.', 500);
            }

            return $this->success('Order created', [
                'order_id'  => $response['id'],
                'amount'    => $amountPaise,
                'currency'  => 'INR',
                'key_id'    => $keyId,
                'demo_mode' => false,
            ]);

        } catch (\Exception $e) {
            Log::error('Razorpay exception: ' . $e->getMessage());
            return $this->error('Payment service unavailable.', 500);
        }
    }

    /**
     * POST /payment/verify
     * Verifies Razorpay payment signature and credits wallet.
     */
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'razorpay_order_id'   => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature'  => ['required', 'string'],
            'amount'              => ['required', 'numeric', 'min:50'],
        ]);

        $keySecret = config('services.razorpay.key_secret');

        // Demo mode: skip signature verification
        if (empty($keySecret) || str_starts_with($data['razorpay_order_id'], 'demo_')) {
            $wallet = $this->walletService->recharge(
                $request->user(),
                (float) $data['amount'],
                'DEMO-' . strtoupper(uniqid())
            );

            return $this->success('Wallet recharged successfully (Demo mode)', [
                'balance' => $wallet->balance,
                'added'   => $data['amount'],
            ]);
        }

        // Verify HMAC SHA256 signature
        $payload        = $data['razorpay_order_id'] . '|' . $data['razorpay_payment_id'];
        $expectedSig    = hash_hmac('sha256', $payload, $keySecret);

        if (!hash_equals($expectedSig, $data['razorpay_signature'])) {
            Log::warning('Razorpay signature mismatch', [
                'user_id'  => $request->user()->id,
                'order_id' => $data['razorpay_order_id'],
            ]);
            return $this->error('Payment verification failed. Contact support.', 422);
        }

        // Credit wallet
        try {
            $wallet = $this->walletService->recharge(
                $request->user(),
                (float) $data['amount'],
                $data['razorpay_payment_id']
            );

            Log::info('Wallet recharged via Razorpay', [
                'user_id'    => $request->user()->id,
                'amount'     => $data['amount'],
                'payment_id' => $data['razorpay_payment_id'],
            ]);

            return $this->success('Payment successful! Wallet recharged.', [
                'balance' => $wallet->balance,
                'added'   => $data['amount'],
            ]);

        } catch (\Exception $e) {
            Log::error('Wallet credit failed after payment: ' . $e->getMessage());
            return $this->error('Payment received but wallet update failed. Contact support with payment ID: ' . $data['razorpay_payment_id'], 500);
        }
    }
}
