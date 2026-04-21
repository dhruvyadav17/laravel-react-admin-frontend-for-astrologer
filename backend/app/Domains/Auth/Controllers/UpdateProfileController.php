<?php

namespace App\Domains\Auth\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Domains\User\Resources\UserResource;

class UpdateProfileController extends Controller
{
    /**
     * PATCH /me
     * Update display name and/or profile image.
     * Optionally change password if current_password is provided.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'             => ['sometimes', 'string', 'min:2', 'max:100'],
            'profile_image'    => ['sometimes', 'nullable', 'string', 'max:500'],
            // Password change fields (all required together)
            'current_password' => ['required_with:new_password', 'string'],
            'new_password'     => ['required_with:current_password', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        // Password change
        if (isset($data['current_password'])) {
            if (! Hash::check($data['current_password'], $user->password)) {
                return $this->error('Current password is incorrect.', 422);
            }
            $user->update(['password' => Hash::make($data['new_password'])]);
            // Remove password fields before profile update
            unset($data['current_password'], $data['new_password'], $data['new_password_confirmation']);
        }

        // Profile update
        $updateData = [];
        if (isset($data['name']))          $updateData['name']          = trim($data['name']);
        if (array_key_exists('profile_image', $data)) $updateData['profile_image'] = $data['profile_image'];

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        return $this->success('Profile updated successfully', [
            'user' => UserResource::make($user->fresh()->load('roles')),
        ]);
    }
}
