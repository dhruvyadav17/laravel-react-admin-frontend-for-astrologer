<?php
// PATH: app/Features/Auth/Services/RefreshTokenService.php
// FIX B4: Refresh response mein new refresh_token nahi tha
//   Old token revoke hota tha, naya nahi milta → next refresh fail → user logout
// FIX: New refresh_token bhi generate karo (rotation pattern)

namespace App\Features\Auth\Services;

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

        // Purana token revoke karo (single-use)
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
