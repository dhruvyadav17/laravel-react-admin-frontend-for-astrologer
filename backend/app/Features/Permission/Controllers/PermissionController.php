<?php

namespace App\Features\Permission\Controllers;

use App\Models\Permission;
use App\Features\Permission\Services\PermissionService;
use App\Http\Controllers\Controller;
use App\Features\Permission\Requests\PermissionRequest;

class PermissionController extends Controller
{
    public function __construct(
        protected PermissionService $service
    ) {}

    public function index()
    {
        return $this->success(
            'Permissions fetched',
            $this->service->list()->map(fn ($p) => [
                'id'   => $p->id,
                'name' => $p->name,
            ])
        );
    }

    public function store(PermissionRequest $request)
    {
        $permission = $this->service->create(
            $request->validated()
        );

        return $this->success(
            'Permission created',
            [
                'id'   => $permission->id,
                'name' => $permission->name,
            ],
            [],
            201
        );
    }

    public function update(
        PermissionRequest $request,
        Permission $permission
    ) {
        $permission = $this->service->update(
            $permission,
            $request->validated()
        );

        return $this->success(
            'Permission updated',
            [
                'id'   => $permission->id,
                'name' => $permission->name,
            ]
        );
    }

    public function destroy(Permission $permission)
    {
        $this->service->delete($permission);

        return $this->success('Permission deleted');
    }
}
