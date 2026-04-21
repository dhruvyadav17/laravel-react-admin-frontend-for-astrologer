<?php

namespace App\Domains\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Requests\RegisterRequest;
use App\Domains\User\Services\UserService;

class RegisterController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    public function __invoke(RegisterRequest $request)
    {
        // FIX BUG-18: register() → create() with default 'user' role
        $this->service->create(
            array_merge($request->validated(), [
                'roles'             => ['user'],
                'email_verified_at' => config('features.email_verification') ? null : now(),
            ])
        );

        return $this->success(
            config('features.email_verification')
                ? 'Registered successfully. Please verify your email.'
                : 'Registered successfully',
            null,
            [],
            201
        );
    }
}
