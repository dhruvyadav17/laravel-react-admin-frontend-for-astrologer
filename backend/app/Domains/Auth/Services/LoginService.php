<?php
// FIX B3: refresh_token was missing from login response
//   Frontend baseQueryWithReauth: localStorage.getItem('refresh_token') → always null
//   Token refresh never worked → users were force-logged out on 401

namespace App\Domains\Auth\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginService
{
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw $this->error('Invalid credentials');
        }

        if (! $user->is_active) {
            throw $this->error('Account is disabled');
        }

        if (config('features.email_verification') && ! $user->hasVerifiedEmail()) {
            throw $this->error('Email not verified');
        }

        // Sanctum access token
        $abilities = $user->getAllPermissions()->pluck('name')->all();
        $token     = $user->createToken('api', $abilities)->plainTextToken;

        // FIX B3: Create and return refresh token
        $refreshToken = null;
        if (config('features.refresh_token')) {
            // Revoke old active tokens (security)
            RefreshToken::where('user_id', $user->id)
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now()]);

            $raw = Str::random(64);

            RefreshToken::create([
                'user_id'    => $user->id,
                'token'      => $raw,
                'expires_at' => now()->addDays(30),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $refreshToken = $raw;
        }

        // Login audit
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ])->save();

        $result = ['token' => $token];

        if ($refreshToken) {
            $result['refresh_token'] = $refreshToken;
        }

        return $result;
    }

    protected function error(string $message): ValidationException
    {
        return ValidationException::withMessages(['email' => [$message]]);
    }
}
