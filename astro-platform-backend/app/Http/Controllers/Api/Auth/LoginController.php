<?php

namespace App\Http\Controllers\Api\Auth;

use App\Services\Auth\LoginService;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Controllers\Controller;

class LoginController extends Controller
{
    public function __invoke(
        LoginRequest $request,
        LoginService $service
    ) {
        return $this->success(
            'Login successful',
            $service->login($request->validated())
        );
    }
}
