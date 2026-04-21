<?php

namespace App\Domains\Auth\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class EmailVerificationController extends Controller
{
    public function verify(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->error('Unauthenticated', 401);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success('Email already verified');
        }

        // FIX BE-4: Use route() not request properties for route params
        if (! hash_equals((string) $request->route('id'), (string) $user->getKey())) {
            return $this->error('Invalid verification link', 403);
        }

        if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return $this->error('Invalid verification hash', 403);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->success('Email verified successfully');
    }

    public function resend(Request $request)
    {
        if (! config('features.email_verification')) {
            return $this->success('Email verification disabled');
        }

        $user = $request->user();

        if (!$user) {
            return $this->error('Unauthenticated', 401);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success('Email already verified');
        }

        $user->sendEmailVerificationNotification();

        return $this->success('Verification email sent');
    }
}
