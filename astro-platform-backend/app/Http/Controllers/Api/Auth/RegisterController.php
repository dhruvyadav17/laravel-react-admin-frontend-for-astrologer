<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\User\UserService;
use App\Traits\ApiResponse;

class RegisterController extends Controller
{

    public function __construct(
        protected UserService $service
    ) {}

    public function __invoke(RegisterRequest $request)
    {
        $this->service->register(
            $request->validated()
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
