<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory(10)->create();

        // 🔮 Astrologer
        $astrologer = User::firstOrCreate(
            ['email' => 'astrologer@test.com'],
            [
                'name' => 'Astrologer User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $astrologer->assignRole('astrologer');

        // 👤 Customer
        $user = User::firstOrCreate(
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
