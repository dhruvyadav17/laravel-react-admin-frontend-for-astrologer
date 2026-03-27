<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        // 🔥 Safe roles (no error if not loaded)
        $roles = $this->whenLoaded(
            'roles',
            fn() => $this->roles->pluck('name')->values()
        );

        // 🔥 SAFE check (no crash if roles not loaded)
        $isAstrologer = $this->relationLoaded('roles')
            ? $this->roles->contains('name', 'astrologer')
            : false;

        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'roles'      => $roles,
            'deleted_at' => $this->deleted_at,

            // 🔥 conditional fields (clean)
            'experience' => $isAstrologer ? $this->experience : null,
            'price_per_minute' => $isAstrologer ? $this->price_per_minute : null,
            'bio' => $isAstrologer ? $this->bio : null,
        ];
    }
}