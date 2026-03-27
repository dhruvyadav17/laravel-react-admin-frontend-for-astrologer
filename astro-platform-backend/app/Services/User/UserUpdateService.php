<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserUpdateService
{
    public function update(User $user, array $data): User
    {
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        unset($data['email']);

        $user->update([
            'name' => $data['name'] ?? $user->name,
            ...$data
        ]);

        if ($user->hasRole('astrologer')) {
            $user->update([
                'experience' => $data['experience'] ?? $user->experience,
                'price_per_minute' => $data['price_per_minute'] ?? $user->price_per_minute,
                'bio' => $data['bio'] ?? $user->bio,
            ]);
        }

        $user->load('roles');

        return $user;
    }
}