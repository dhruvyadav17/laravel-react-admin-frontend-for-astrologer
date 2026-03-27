<?php

namespace App\Services\User;

use App\Models\User;
use Spatie\Permission\PermissionRegistrar;

class UserRoleService
{
    public function assignRoles(User $user, array $roles): void
    {
        $user->syncRoles($roles);
        $user->load('roles');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}