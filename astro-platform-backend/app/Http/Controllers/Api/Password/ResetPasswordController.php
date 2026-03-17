<?php

namespace App\Http\Controllers\Api\Password;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
// use App\Http\Controllers\Controller;
// use App\Traits\ApiResponse;

class ResetPasswordController extends Controller
{

    /**
     * POST /api/reset-password
     */
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required',
            'password'              => 'required|confirmed|min:6',
        ]);

        $status = Password::reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'password_confirmation' => $request->password_confirmation,
                'token' => $data['token'],
            ],
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success(
                'Password reset successful'
            );
        }

        return $this->error(
            'Password reset failed',
            ['email' => __($status)],
            422
        );
    }
}
