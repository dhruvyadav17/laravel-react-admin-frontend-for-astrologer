<?php
// PATH: app/Http/Controllers/Api/Auth/RegisterController.php
// FIX BUG-18: UserService::register() method exist nahi karta tha
//             RegisterController woh call karta tha → 500 error on registration
//             Fix: UserService::create() directly call karo — woh sab handle karta hai
//             Aur 'user' role by default assign karo register pe

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\User\UserService;

class RegisterController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    public function __invoke(RegisterRequest $request)
    {
        // FIX BUG-18: register() → create() with default 'user' role
        $this->service->create(
            array_merge($request->validated(), [
                'roles'             => ['user'],
                'email_verified_at' => config('features.email_verification') ? null : now(),
            ])
        );

        return $this->success(
            config('features.email_verification')
                ? 'Registered successfully. Please verify your email.'
                : 'Registered successfully',
            null,
            [],
            201
        );
    }
}
