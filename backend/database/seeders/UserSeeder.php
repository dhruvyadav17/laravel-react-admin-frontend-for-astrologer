<?php
// Generates test users, astrologers, and a default test customer
// Uses factories for realistic seed data instead of a single hardcoded astrologer

namespace Database\Seeders;

use App\Models\Astrologer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // -- 10 random customers ---------------------------------
        User::factory(10)->customer()->create();

        // -- Main test astrologer (deterministic email) -----------
        $aUser = User::updateOrCreate(
            ['email' => 'astrologer@test.com'],
            [
                'name'              => 'Rajesh Sharma',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'profile_image'     => 'https://i.pravatar.cc/150?u=rajesh',
                'is_verified'       => true,
            ]
        );
        $aUser->syncRoles('astrologer');

        Astrologer::updateOrCreate(
            ['user_id' => $aUser->id],
            [
                'experience'          => 10,
                'price_per_minute'    => 25,
                'bio'                 => 'Expert Vedic astrologer with 10+ years of experience in Kundli, Match Making, and Career guidance.',
                'expertise'           => 'Vedic Astrology',
                'languages'           => ['Hindi', 'English'],
                'skills'              => ['Kundli', 'Match Making', 'Career', 'Love'],
                'consultation_type'   => 'all',   // NEW FIELD
                'rating'              => 4.8,
                'total_reviews'       => 256,
                'total_consultations' => 1200,    // NEW FIELD
                'is_online'           => true,
                'is_available'        => true,    // NEW FIELD
                'is_verified'         => true,
                'profile_image'       => 'https://i.pravatar.cc/150?u=rajesh',
                'gallery'             => [],
            ]
        );

        // -- 5 factory astrologers (realistic data) ---------------
        // Generate 5 realistic test astrologers via factory
        User::factory(5)->astrologer()->create()->each(function ($user) {
            \App\Models\Astrologer::factory()->create(['user_id' => $user->id]);
        });

        // -- Test customer ----------------------------------------
        $cUser = User::updateOrCreate(
            ['email' => 'user@test.com'],
            [
                'name'              => 'Test Customer',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $cUser->syncRoles('user');
    }
}