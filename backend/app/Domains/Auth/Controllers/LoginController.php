<?php

namespace App\Domains\Auth\Controllers;

use App\Domains\Auth\Services\LoginService;
use App\Domains\Auth\Requests\LoginRequest;
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
