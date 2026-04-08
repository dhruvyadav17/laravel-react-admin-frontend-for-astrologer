<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginService
{
    public function login(array $credentials): array
    {
        /* =====================================================
           FEATURE FLAG
        ===================================================== */
        if (! config('features.login_rate_limit')) {
            throw $this->error('Login temporarily disabled');
        }

        /* =====================================================
           USER FETCH (single query)
        ===================================================== */
        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        /* =====================================================
           CREDENTIAL CHECK
        ===================================================== */
        if (
            ! $user ||
            ! Hash::check($credentials['password'], $user->password)
        ) {
            throw $this->error('Invalid credentials');
        }

        /* =====================================================
           ACCOUNT STATE CHECKS
        ===================================================== */
        if (! $user->is_active) {
            throw $this->error('Account is disabled');
        }

        if (
            config('features.email_verification') &&
            ! $user->hasVerifiedEmail()
        ) {
            throw $this->error('Email not verified');
        }

        /* =====================================================
           TOKEN CREATION
        ===================================================== */
        $abilities = $user
            ->getAllPermissions()
            ->pluck('name')
            ->all();

        $token = $user
            ->createToken('api', $abilities)
            ->plainTextToken;

        /* =====================================================
           LOGIN AUDIT (NON-BLOCKING)
        ===================================================== */
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ])->save();

        return [
            'token' => $token,
        ];
    }

    /* =====================================================
       CENTRAL ERROR FORMAT
       (keeps controller & service clean)
    ===================================================== */
    protected function error(string $message): ValidationException
    {
        return ValidationException::withMessages([
            'email' => [$message],
        ]);
    }
}
