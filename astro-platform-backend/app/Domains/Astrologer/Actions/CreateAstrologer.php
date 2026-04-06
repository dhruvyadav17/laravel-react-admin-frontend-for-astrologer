<?php

namespace App\Domains\Astrologer\Actions;

use App\Models\User;
use App\Models\Astrologer;
use App\Domains\Astrologer\DTO\AstrologerData;
use Illuminate\Support\Facades\Hash;

class CreateAstrologer
{
    public function execute(AstrologerData $dto): array
    {
        if (User::where('email', $dto->email)->exists()) {
            throw new \Exception('Email already exists');
        }
        $password = str()->random(10);

        $user = User::create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => Hash::make($password),
            'email_verified_at' => now(),
            'is_verified' => true,
            'profile_image' => $dto->profile_image,
        ]);

        $user->assignRole('astrologer');

        $astrologer = Astrologer::create([
            'user_id' => $user->id,
            'experience' => $dto->experience,
            'price_per_minute' => $dto->price_per_minute,
            'bio' => $dto->bio,
            'expertise' => $dto->expertise,
            'languages' => $dto->languages,
            'skills' => $dto->skills,
            'consultation_type' => $dto->consultation_type,
            'is_verified' => true,
            'is_available' => true,
        ]);

        return [
            'user' => $user,
            'astrologer' => $astrologer->load('user'),
            'password' => $password,
        ];
    }
}
