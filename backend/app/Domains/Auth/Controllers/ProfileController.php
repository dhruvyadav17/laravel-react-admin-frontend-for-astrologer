<?php

namespace App\Domains\Auth\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Domains\User\Resources\UserResource;

class ProfileController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user()->load('roles');

        return $this->success('Profile fetched', [
            'user' => UserResource::make($user),

            'roles' => $user->getRoleNames()->values(),

            'permissions' => $user
                ->getAllPermissions()
                ->pluck('name')
                ->values(),
        ]);
    }
}
