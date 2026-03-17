<?php

namespace App\Http\Controllers\Api\Auth;

use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;

class ProfileController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user()->load('roles');

        return $this->success('Profile fetched', [
            'user' => UserResource::make($user),
            'permissions' => $user
                ->getAllPermissions()
                ->pluck('name')
                ->values(),
        ]);
    }
}
