<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Astrologer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ================= NORMAL USERS =================
        User::factory(10)->create();

        // ================= ASTROLOGER =================
        $user = User::updateOrCreate(
            ['email' => 'astrologer@test.com'],
            [
                'name' => 'Astrologer User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),

                // 🔥 USER LEVEL (ONLY BASIC)
                'profile_image' => 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
                'is_verified' => true,
            ]
        );

        // assign role
        $user->assignRole('astrologer');

        // 🔥 CREATE ASTROLOGER PROFILE
        Astrologer::updateOrCreate(
            ['user_id' => $user->id],
            [
                'experience' => 5,
                'price_per_minute' => 20,
                'bio' => 'Expert astrologer with 5+ years experience',
                'expertise' => 'Vedic Astrology',

                'languages' => ['Hindi', 'English'],
                'skills' => ['Kundli', 'Palmistry'],

                'rating' => 4.5,
                'total_reviews' => 120,

                'is_online' => true,
                'is_verified' => true,

                'profile_image' => 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
                'gallery' => [
                    'https://images.unsplash.com/photo-1',
                    'https://images.unsplash.com/photo-2',
                ],
            ]
        );

        // ================= CUSTOMER =================
        $customer = User::updateOrCreate(
            ['email' => 'user@test.com'],
            [
                'name' => 'Customer User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $customer->assignRole('user');
    }
}
