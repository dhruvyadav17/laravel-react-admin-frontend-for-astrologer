<?php

namespace App\Domains\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Auth\Requests\RefreshTokenRequest;
use App\Domains\Auth\Services\RefreshTokenService;

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
