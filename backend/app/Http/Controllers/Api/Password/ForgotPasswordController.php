<?php

namespace App\Http\Controllers\Api\Password;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use App\Notifications\ApiResetPasswordNotification;
// use App\Traits\ApiResponse;

class ForgotPasswordController extends Controller
{

    /**
     * POST /api/forgot-password
     */
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            ['email' => $data['email']],
            function ($user, $token) {
                $user->notify(
                    new ApiResetPasswordNotification($token)
                );
            }
        );

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success(
                'Password reset link sent successfully'
            );
        }

        return $this->error(
            'Unable to send reset link',
            ['email' => __($status)],
            422
        );
    }
}
