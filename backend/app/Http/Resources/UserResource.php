<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,

            'roles' => $this->whenLoaded(
                'roles',
                fn() => $this->roles->pluck('name')->values()
            ),

            'deleted_at' => $this->deleted_at,

            // 🔥 CLEAN (MODEL BASED)
            'experience' => $this->when(
                $this->isAstrologer(),
                $this->experience
            ),

            'price_per_minute' => $this->when(
                $this->isAstrologer(),
                $this->price_per_minute
            ),

            'bio' => $this->when(
                $this->isAstrologer(),
                $this->bio
            ),
            // 'deleted_at' => $this->deleted_at,
            'is_archived' => $this->deleted_at !== null,
        ];
    }
}
