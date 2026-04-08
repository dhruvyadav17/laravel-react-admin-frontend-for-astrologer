<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// use App\Http\Controllers\Controller;
// use App\Traits\ApiResponse;
use Illuminate\Auth\Events\Verified;

class EmailVerificationController extends Controller
{

    public function verify(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success(
                'Email already verified'
            );
        }

        if (
            ! hash_equals(
                (string) $request->id,
                (string) $user->getKey()
            )
        ) {
            return $this->error(
                'Invalid verification link',
                null,
                403
            );
        }

        if (
            ! hash_equals(
                (string) $request->hash,
                sha1($user->getEmailForVerification())
            )
        ) {
            return $this->error(
                'Invalid verification hash',
                null,
                403
            );
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->success(
            'Email verified successfully'
        );
    }

    public function resend(Request $request)
    {
        if (! config('features.email_verification')) {
            return $this->success('Email verification disabled');
        }

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success('Email already verified');
        }

        $user->sendEmailVerificationNotification();

        return $this->success('Verification email sent');
    }

}