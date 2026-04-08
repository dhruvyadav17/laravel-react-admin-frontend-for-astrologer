<?php
// PATH: database/seeders/RolePermissionSeeder.php
// UPDATE: Admin ko astrologer permissions assign kiye, manager updated
// REASON: Admin ke paas sirf user-* permissions the, astrologer manage nahi kar sakta tha.
//         astrologer-verify, astrologer-restore pehle missing the.

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $guard = 'api';

        $superAdmin = Role::where('name','super-admin')->first();
        $admin      = Role::where('name','admin')->first();
        $manager    = Role::where('name','manager')->first();
        $astrologer = Role::where('name','astrologer')->first();
        $user       = Role::where('name','user')->first();

        // SUPER ADMIN — full access (Gate::before handles this, but sync anyway)
        if ($superAdmin) {
            $superAdmin->syncPermissions(Permission::where('guard_name', $guard)->get());
        }

        // ADMIN — user + astrologer + RBAC management
        if ($admin) {
            $admin->syncPermissions([
                'user-view','user-create','user-update','user-delete',
                'user-restore','user-assign-role','user-assign-permission',
                // NEW: astrologer permissions
                'astrologer-view','astrologer-create','astrologer-update',
                'astrologer-delete','astrologer-restore','astrologer-verify',
                'role-manage','permission-manage','dashboard-view',
            ]);
        }

        // MANAGER — view + update only (no delete/create/rbac)
        if ($manager) {
            $manager->syncPermissions([
                'user-view','user-update',
                'astrologer-view','astrologer-update','astrologer-verify', // NEW
                'dashboard-view',
            ]);
        }

        // ASTROLOGER — no admin permissions (handled by role middleware + portal routes)
        if ($astrologer) $astrologer->syncPermissions([]);

        // USER — no admin permissions
        if ($user) $user->syncPermissions([]);
    }
}