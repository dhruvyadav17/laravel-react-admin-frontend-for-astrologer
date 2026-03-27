<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\PermissionRegistrar;

class UserCreateService
{
    protected function createBase(array $data): User
    {
        return User::create([
            'name'  => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_active' => $data['is_active'] ?? true,
            'force_password_reset' => $data['force_password_reset'] ?? false,
            'email_verified_at' => $data['email_verified_at'] ?? null,
        ]);
    }

    public function create(array $data): User
    {
        return $this->createBase($data);
    }

    public function createAdmin(array $data): array
    {
        $password = Str::random(12);

        $user = $this->createBase([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $password,
            'email_verified_at' => now(),
        ]);

        $user->assignRole($data['role']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Log::info('Admin created', ['id' => $user->id]);

        return [
            'user' => $user,
            'password' => $password,
        ];
    }
}