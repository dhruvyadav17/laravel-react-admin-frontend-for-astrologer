<?php

namespace App\Services\User;

use App\Models\User;
use App\Models\Astrologer;
use App\Models\Permission;
use App\Queries\UserQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Support\Pagination;
use Spatie\Permission\PermissionRegistrar;

class UserService
{
    /* ================= LIST ================= */

    public function paginate(Request $request): array
    {
        $query = UserQuery::withRoles();

        $query = UserQuery::search($query, $request->search);
        $query = UserQuery::latest($query);

        $users = $query->paginate($request->per_page ?? 10);

        return Pagination::response($users);
    }

    /* ================= BASE CREATE ================= */

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

    /* ================= CREATE ================= */

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {

            $user = $this->createBase($data);

            /* ================= ROLES ================= */
            if (!empty($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            /* ================= ASTROLOGER CREATE ================= */
            if ($user->hasRole('astrologer')) {
                Astrologer::create([
                    'user_id' => $user->id,
                    'experience' => $data['experience'] ?? 0,
                    'price_per_minute' => $data['price_per_minute'] ?? 0,
                    'bio' => $data['bio'] ?? null,
                    'expertise' => $data['expertise'] ?? null,
                    'languages' => $data['languages'] ?? [],
                    'skills' => $data['skills'] ?? [],
                ]);
            }

            /* ================= PERMISSIONS ================= */
            if (!empty($data['permissions'])) {
                $user->syncPermissions($data['permissions']);
            }

            $this->clearUserCache();

            return $user;
        });
    }

    /* ================= ADMIN CREATE ================= */

    public function createAdmin(array $data): array
    {
        $password = Str::random(12);

        $user = DB::transaction(function () use ($data, $password) {

            $user = $this->createBase([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $password,
                'email_verified_at' => now(),
            ]);

            $user->assignRole($data['role']);

            return $user;
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Log::info('Admin created', ['id' => $user->id]);

        $this->clearUserCache();

        return [
            'user' => $user,
            'password' => $password,
        ];
    }

    /* ================= UPDATE ================= */

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {

            /* ================= PASSWORD ================= */
            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            unset($data['email']);

            /* ================= USER UPDATE ================= */
            $user->update([
                'name' => $data['name'] ?? $user->name,
                ...$data
            ]);

            /* ================= ASTROLOGER UPDATE ================= */
            if ($user->hasRole('astrologer')) {
                Astrologer::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'experience' => $data['experience'] ?? 0,
                        'price_per_minute' => $data['price_per_minute'] ?? 0,
                        'bio' => $data['bio'] ?? null,
                        'expertise' => $data['expertise'] ?? null,
                        'languages' => $data['languages'] ?? [],
                        'skills' => $data['skills'] ?? [],
                    ]
                );
            }

            /* ================= ROLES ================= */
            if (!empty($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            /* ================= PERMISSIONS ================= */
            if (!empty($data['permissions'])) {
                $user->syncPermissions($data['permissions']);
            }

            $user->load('roles');

            $this->clearUserCache();

            return $user;
        });
    }

    /* ================= DELETE / RESTORE ================= */

    public function delete(User $user): void
    {
        $user->delete();
        $this->clearUserCache();
    }

    public function restore(User $user): void
    {
        $user->restore();
        $this->clearUserCache();
    }

    /* ================= ROLES ================= */

    public function assignRoles(User $user, array $roles): void
    {
        $user->syncRoles($roles);
        $user->load('roles');

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->clearUserCache();
    }

    /* ================= PERMISSIONS ================= */

    public function assignPermissions(User $user, array $permissions): void
    {
        DB::transaction(function () use ($user, $permissions) {
            $user->syncPermissions($permissions);
        });

        $this->clearUserCache();
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

    /* ================= CACHE CLEAR ================= */

    protected function clearUserCache(): void
    {
        Cache::forget('users_list');
        Cache::forget('dashboard_stats');
        Cache::forget('astrologers_list');
    }
}
