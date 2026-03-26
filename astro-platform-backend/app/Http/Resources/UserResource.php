<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $roles = $this->whenLoaded(
            'roles',
            fn() =>
            $this->roles->pluck('name')->values()
        );

        $isAstrologer = $this->roles->contains('name', 'astrologer');

        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'roles'      => $roles,
            'deleted_at' => $this->deleted_at,

            // 🔥 astrologer fields
            'experience' => $isAstrologer ? $this->experience : null,
            'price_per_minute' => $isAstrologer ? $this->price_per_minute : null,
            'bio' => $isAstrologer ? $this->bio : null,
        ];
    }
}
