<?php

namespace App\Services\User;

use App\Models\User;
use App\Queries\UserQuery;
use Illuminate\Http\Request;
use App\Support\Pagination;
class UserService
{
    public function __construct(
        protected UserCreateService $createService,
        protected UserUpdateService $updateService,
        protected UserRoleService $roleService,
        protected UserPermissionService $permissionService
    ) {}

    /* ================= LIST ================= */

    public function paginate(Request $request): array
    {
        $query = UserQuery::withRoles();

        $query = UserQuery::search($query, $request->search);
        $query = UserQuery::latest($query);

        $users = $query->paginate($request->per_page ?? 10);

        return Pagination::response($users);
    }

    /* ================= CREATE ================= */

    public function create(array $data): User
    {
        return $this->createService->create($data);
    }

    public function createAdmin(array $data): array
    {
        return $this->createService->createAdmin($data);
    }

    /* ================= UPDATE ================= */

    public function update(User $user, array $data): User
    {
        return $this->updateService->update($user, $data);
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
        $this->roleService->assignRoles($user, $roles);
    }

    /* ================= PERMISSIONS ================= */

    public function assignPermissions(User $user, array $permissions): void
    {
        $this->permissionService->assignPermissions($user, $permissions);
    }

    public function permissions(User $user): array
    {
        return $this->permissionService->permissions($user);
    }
}