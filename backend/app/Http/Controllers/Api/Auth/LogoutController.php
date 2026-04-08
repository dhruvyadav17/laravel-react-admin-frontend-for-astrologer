<?php

namespace App\Http\Controllers\Api\Auth;

use App\Models\RefreshToken;
// use App\Http\Controllers\Controller;
// use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LogoutController extends Controller
{

    public function __invoke(Request $request)
    {
        if ($token = $request->user()->currentAccessToken()) {
            $token->delete();
        }

        if (config('features.refresh_token')) {
            RefreshToken::where('user_id', $request->user()->id)
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now()]);
        }

        return $this->success('Logged out successfully');
    }
}
