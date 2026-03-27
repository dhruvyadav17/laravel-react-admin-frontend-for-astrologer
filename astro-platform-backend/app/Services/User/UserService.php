<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Spatie\Permission\PermissionRegistrar;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class UserService
{
    /* ================= LIST ================= */

    public function paginate(Request $request): array
    {
        $users = User::query()
            ->select([
                'id',
                'name',
                'email',
                'experience',
                'price_per_minute',
                'bio',
                'deleted_at',
                'created_at'
            ])
            ->withTrashed()
            ->with('roles:id,name')

            // 🔍 SEARCH (FIXED BUG 🔥 OR CONDITION ISSUE)
            ->when(
                $request->filled('search'),
                function ($q) use ($request) {
                    $q->where(function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%")
                            ->orWhere('email', 'like', "%{$request->search}%");
                    });
                }
            )

            ->latest()
            ->paginate($request->per_page ?? 10);

        return [
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ];
    }

    /* ================= CORE CREATOR (INTERNAL) ================= */

    protected function createBase(array $data): User
    {
        return User::create([
            'name'                  => $data['name'],
            'email'                 => $data['email'],
            'password'              => Hash::make($data['password']),
            'is_active'             => $data['is_active'] ?? true,
            'force_password_reset'  => $data['force_password_reset'] ?? false,
            //'password_expires_at'   => $data['password_expires_at'] ?? null,
            'email_verified_at'     => $data['email_verified_at'] ?? null,
        ]);
    }

    /* ================= ADMIN PANEL USER ================= */

    public function create(array $data): User
    {
        return $this->createBase($data);
    }

    /* ================= ADMIN CREATION ================= */

    public function createAdmin(array $data): array
    {
        $password = Str::random(12);

        $user = $this->createBase([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'password'          => $password,
            'email_verified_at' => now(), // auto verified
        ]);

        $user->assignRole($data['role']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Log::info('Admin created', ['id' => $user->id]);

        return [
            'user'     => $user,
            'password' => $password, // shown once
        ];
    }

    /* ================= PUBLIC REGISTER ================= */

    public function register(array $data): User
    {
        $user = $this->createBase([
            'name'  => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'password_expires_at' => config('features.password_expiry')
                ? Carbon::now()->addDays(90)
                : null,
            'email_verified_at' => config('features.email_verification')
                ? null
                : now(),
        ]);

        $user->assignRole('user');

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return $user;
    }

    /* ================= DELETE / RESTORE ================= */

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function restore(User $user): void
    {
        $user->restore();
    }

    /* ================= ROLES ================= */

    public function assignRoles(User $user, array $roles): void
    {
        $user->syncRoles($roles);
        $user->load('roles');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /* ================= PERMISSIONS ================= */

    public function assignPermissions(User $user, array $permissions): void
    {
        DB::transaction(function () use ($user, $permissions) {

            // 🔥 Clear cache BEFORE syncing
            //app(PermissionRegistrar::class)->forgetCachedPermissions();

            // Sync permissions
            $user->syncPermissions($permissions);

            // Refresh model relations
            //$user->load('permissions');
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


    /* ================= UPDATE ================= */

    public function update(User $user, array $data): User
    {

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // 🔥 prevent email change on update
        unset($data['email']);

        // ================= BASE UPDATE =================
        $user->update([
            'name' => $data['name'] ?? $user->name,
            ...$data
        ]);

        // ================= ASTROLOGER FIELDS =================
        $isAstrologer = $user->roles()->where('name', 'astrologer')->exists();

        if ($isAstrologer) {
            $user->update([
                'experience' => $data['experience'] ?? $user->experience,
                'price_per_minute' => $data['price_per_minute'] ?? $user->price_per_minute,
                'bio' => $data['bio'] ?? $user->bio,
            ]);
        }

        // ================= RELATIONS =================
        $user->load('roles');


        return $user;
    }
}
