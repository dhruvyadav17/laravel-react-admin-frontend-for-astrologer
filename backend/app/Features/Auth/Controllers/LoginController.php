<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Services\LoginService;
use App\Features\Auth\Requests\LoginRequest;
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
