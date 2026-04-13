<?php
// UPDATE -- added astrologer() and customer() factory states
// Added astrologer() and customer() states for use in UserSeeder

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'               => fake()->name(),
            'email'              => fake()->unique()->safeEmail(),
            'email_verified_at'  => now(),
            'password'           => Hash::make('password'),
            'remember_token'     => str()->random(10),
            'is_active'          => true,
            'is_verified'        => false,
            'profile_image'      => 'https://i.pravatar.cc/150?u='.fake()->unique()->userName(),
        ];
    }

    /** Admin user -- was already present, kept */
    public function admin(): static
    {
        return $this->afterCreating(fn($u) => $u->assignRole('admin'));
    }

    /** NEW: Astrologer user -- needed for AstrologerFactory */
    public function astrologer(): static
    {
        return $this->state(['is_verified' => true])
            ->afterCreating(fn($u) => $u->assignRole('astrologer'));
    }

    /** NEW: Regular customer */
    public function customer(): static
    {
        return $this->afterCreating(fn($u) => $u->assignRole('user'));
    }

    /** NEW: Unverified email */
    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }
}