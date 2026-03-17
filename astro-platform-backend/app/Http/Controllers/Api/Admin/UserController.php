<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Permission; 
use App\Services\User\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\UserRequest;

class UserController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    /* ================= LIST ================= */

    public function index(Request $request)
    {
        $result = $this->service->paginate($request);

        return $this->success(
            'Users fetched successfully',
            UserResource::collection($result['data']),
            $result['meta']
        );
    }

    /* ================= CREATE ================= */

    public function store(UserRequest $request)
    {
        $user = $this->service->create(
            $request->validated()
        );

        return $this->success(
            'User created successfully',
            new UserResource($user),
            [],
            201
        );
    }

    /* ================= ARCHIVE ================= */

    public function destroy(User $user)
    {
        $this->service->delete($user);

        return $this->success(
            'User archived successfully',
            null
        );
    }

    /* ================= RESTORE ================= */

    public function restore(User $user)
    {
        $this->service->restore($user);

        return $this->success(
            'User restored successfully',
            null
        );
    }

    /* ================= ROLES ================= */

    public function assignRole(Request $request, User $user)
    {
        $data = $request->validate([
            'roles'   => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $this->service->assignRoles(
            $user,
            $data['roles'] ?? []
        );

        return $this->success(
            'Roles assigned successfully',
            [
                'roles' => $user->getRoleNames()->values(),
            ]
        );
    }

    /* ================= PERMISSIONS ================= */

    public function permissions(User $user)
    {
        return $this->success(
            'User permissions fetched',
            $this->service->permissions($user)
        );
    }

public function assignPermissions(Request $request, User $user)
{
    $data = $request->validate([
        'permissions'   => ['nullable', 'array'],
        'permissions.*' => ['string', 'exists:permissions,name'],
    ]);

    $permissions = $data['permissions'] ?? [];

    $this->service->assignPermissions($user, $permissions);

    // 🔥 Reload fresh permissions
    $user->load('permissions');

    Log::info('Assigned permissions to user', [
        'user_id'     => $user->id,
        'permissions' => $permissions,
    ]);

    return $this->success(
        'Permissions assigned successfully.',
        [
            'assigned' => $user->permissions
                ->pluck('name')
                ->values(),
        ]
    );
}
}
