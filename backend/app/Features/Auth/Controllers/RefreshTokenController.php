<?php

namespace App\Features\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Auth\Requests\RefreshTokenRequest;
use App\Features\Auth\Services\RefreshTokenService;

class RefreshTokenController extends Controller
{
    public function __invoke(
        RefreshTokenRequest $request,
        RefreshTokenService $service
    ) {
        return $this->success(
            'Token refreshed successfully',
            $service->refresh($request->validated())
        );
    }
}
