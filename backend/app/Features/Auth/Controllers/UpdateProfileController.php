<?php
// Allows authenticated users to update their display name

namespace App\Features\Auth\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Features\User\Resources\UserResource;

class UpdateProfileController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $user = $request->user();
        $user->update(['name' => trim($data['name'])]);

        return $this->success('Profile updated', [
            'user' => UserResource::make($user->fresh()->load('roles')),
        ]);
    }
}
