<?php

namespace App\Features\User\Controllers;

use App\Http\Controllers\Controller;
use App\Features\User\Resources\UserResource;
use App\Features\User\Requests\UserRequest;
use App\Models\User;
use App\Features\User\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct(protected UserService $service) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate(['per_page' => ['nullable', 'integer', 'min:5', 'max:100']]);
        $result = $this->service->paginate($request);

        return $this->success(
            'Users fetched successfully',
            UserResource::collection($result['data']),
            $result['meta']
        );
    }

    public function store(UserRequest $request): JsonResponse
    {
        $user = $this->service->create($request->validated());
        return $this->success('User created successfully', new UserResource($user), [], 201);
    }

    public function update(UserRequest $request, User $user): JsonResponse
    {
        $updated = $this->service->update($user, $request->validated());
        return $this->success('User updated successfully', new UserResource($updated));
    }

    public function destroy(User $user): JsonResponse
    {
        $this->service->delete($user);
        return $this->success('User archived successfully');
    }

    public function restore(int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $this->service->restore($user);
        return $this->success('User restored successfully');
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'roles'   => ['array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $this->service->assignRoles($user, $data['roles'] ?? []);

        return $this->success('Roles assigned successfully', [
            'roles' => $user->getRoleNames()->values(),
        ]);
    }

    public function permissions(User $user): JsonResponse
    {
        return $this->success('User permissions fetched', $this->service->permissions($user));
    }

    public function assignPermissions(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'permissions'   => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $permissions = $data['permissions'] ?? [];
        $this->service->assignPermissions($user, $permissions);
        $user->load('permissions');

        Log::info('Assigned permissions to user', ['user_id' => $user->id, 'permissions' => $permissions]);

        return $this->success('Permissions assigned successfully', [
            'assigned' => $user->permissions->pluck('name')->values(),
        ]);
    }
}
