<?php

namespace App\Services\Role;

use App\Models\Role;
use App\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleService
{
    /**
     * 📄 List all roles
     */
    public function list()
    {
        return Role::withCount('permissions')
            ->orderBy('name')
            ->get();
    }

    /**
     * ➕ Create new role
     */
    public function create(array $data): Role
    {
        $role = Role::create([
            'name'       => $data['name'],
            'guard_name' => 'api',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role;
    }

    /**
     * ✏️ Update role
     */
    public function update(Role $role, array $data): Role
    {
        if ($role->name === 'super-admin') {
            abort(403, 'Super admin role cannot be modified');
        }

        $role->update([
            'name' => $data['name'],
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $role;
    }

    /**
     * ❌ Delete role
     */
    public function delete(Role $role): void
    {
        if ($role->name === 'super-admin') {
            abort(403, 'Super admin role cannot be deleted');
        }

        $role->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * 🔁 Enable / Disable role
     */
    public function toggle(Role $role): Role
    {
        if ($role->name === 'super-admin') {
            abort(403, 'Super admin role cannot be disabled');
        }

        $role->update([
            'is_active' => ! $role->is_active,
        ]);

        return $role;
    }

    /**
     * 🔐 Assign permissions to role
     */
    public function syncPermissions(Role $role, array $permissions = []): void
    {
        if ($role->name === 'super-admin') {
            abort(403, 'Super admin permissions cannot be modified');
        }

        $role->syncPermissions($permissions);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * 📦 Permissions data for UI (checkbox modal)
     */
    public function permissions(Role $role): array
    {
        return [
            'role'        => $role,
            'permissions' => Permission::select('id', 'name')
                ->orderBy('name')
                ->get(),
            'assigned'    => $role->permissions
                ->pluck('name')
                ->values(),
        ];
    }
}
