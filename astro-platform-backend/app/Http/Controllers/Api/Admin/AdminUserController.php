<?php

namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Services\User\UserService;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    public function store(UserRequest $request)
    {
        $result = $this->service->createAdmin(
            $request->validated()
        );

        return $this->success(
            'Admin created successfully',
            [
                'email'    => $result['user']->email,
                'password' => $result['password'], // show once
            ],
            [],
            201
        );
    }
}
