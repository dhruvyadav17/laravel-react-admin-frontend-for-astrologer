<?php

namespace App\Services\Auth;

use App\Models\RefreshToken;
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

        // 🔒 single-use rotation
        $record->update([
            'revoked_at' => now(),
        ]);

        $abilities = $user
            ->getAllPermissions()
            ->pluck('name')
            ->toArray();

        return [
            'token' => $user
                ->createToken('api', $abilities)
                ->plainTextToken,
        ];
    }
}
