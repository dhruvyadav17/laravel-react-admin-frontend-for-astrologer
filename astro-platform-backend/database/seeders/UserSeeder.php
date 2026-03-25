<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ================= NORMAL USERS =================
        User::factory(10)->create();

        // ================= ASTROLOGER =================
        $astrologer = User::updateOrCreate(
            ['email' => 'astrologer@test.com'],
            [
                'name' => 'Astrologer User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),

                // 🔥 PROFILE
                'profile_image' => 'https://images.unsplash.com/photo-1607746882042-944635dfe10e',

                // 🔥 GALLERY (ARRAY)
                'gallery' => [
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
                    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9',
                ],

                // 🔥 DETAILS
                'bio' => 'Experienced astrologer with 8 years of practice. Specializes in Vedic astrology, tarot readings, and numerology. Passionate about helping clients find clarity and guidance in their lives.',

                'expertise' => 'Vedic, Tarot, Numerology, Palmistry, Astro Counseling',

                // 🔥 JSON FIELDS (NO json_encode needed if cast used)
                'languages' => ['Hindi', 'English','banali','tamil','kannada'],
                'skills' => ['Vedic', 'Tarot', 'Numerology', 'Palmistry', 'Astro Counseling'],

                // 🔥 BUSINESS DATA
                'experience' => 8,
                'price_per_minute' => 5,

                // 🔥 STATUS
                'is_verified' => true,
                'is_online' => true,

                // 🔥 RATING
                'rating' => 4.6,
                'total_reviews' => 140,
            ]
        );

        $astrologer->assignRole('astrologer');

        // ================= CUSTOMER =================
        $user = User::updateOrCreate(
            ['email' => 'user@test.com'],
            [
                'name' => 'Customer User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $user->assignRole('user');
    }
}