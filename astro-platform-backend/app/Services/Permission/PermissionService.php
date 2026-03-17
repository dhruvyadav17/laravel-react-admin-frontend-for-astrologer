<?php

namespace App\Services\Permission;

use App\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionService
{
    /**
     * List all permissions
     */
    public function list()
    {
        return Permission::orderBy('name')->get();
    }

    /**
     * Create permission
     */
    public function create(array $data): Permission
    {
        $permission = Permission::create([
            'name'       => $data['name'],
            'guard_name' => 'api',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $permission;
    }

    /**
     * Update permission
     */
    public function update(Permission $permission, array $data): Permission
    {
        $permission->update([
            'name' => $data['name'],
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $permission;
    }

    /**
     * Delete permission
     */
    public function delete(Permission $permission): void
    {
        $permission->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Enable / Disable permission
     */
    public function toggle(Permission $permission): Permission
    {
        $permission->update([
            'is_active' => ! $permission->is_active,
        ]);

        return $permission;
    }
}
