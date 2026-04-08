<?php

namespace App\Features\User\Controllers;
use App\Http\Controllers\Controller;
use App\Features\User\Requests\UserRequest;
use App\Features\User\Services\UserService;

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
