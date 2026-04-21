<?php
// FIX B4: New refresh_token was missing from refresh response
//   Old token was revoked but new one not returned → next refresh failed → forced logout

namespace App\Domains\Auth\Services;

use App\Models\RefreshToken;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RefreshTokenService
{
    public function refresh(array $data): array
    {
        if (! config('features.refresh_token')) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Refresh token feature disabled'],
            ]);
        }

        $record = RefreshToken::active()
            ->where('token', $data['refresh_token'])
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Invalid or expired refresh token'],
            ]);
        }

        $user = $record->user;

        // Revoke old token (single-use)
        $record->update(['revoked_at' => now()]);

        // Naya access token
        $abilities   = $user->getAllPermissions()->pluck('name')->toArray();
        $accessToken = $user->createToken('api', $abilities)->plainTextToken;

        // FIX B4: Naya refresh token bhi banao
        $raw = Str::random(64);

        RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => $raw,
            'expires_at' => now()->addDays(30),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return [
            'token'         => $accessToken,
            'refresh_token' => $raw,
        ];
    }
}
