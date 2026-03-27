<?php

namespace App\Services\User;

use App\Models\User;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class UserPermissionService
{
    public function assignPermissions(User $user, array $permissions): void
    {
        DB::transaction(function () use ($user, $permissions) {
            $user->syncPermissions($permissions);
        });
    }

    public function permissions(User $user): array
    {
        return [
            'permissions' => Permission::query()
                ->select('id', 'name')
                ->orderBy('name')
                ->get(),

            'assigned' => $user
                ->getAllPermissions()
                ->pluck('name')
                ->values(),
        ];
    }
}