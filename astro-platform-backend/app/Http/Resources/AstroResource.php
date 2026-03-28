<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AstroResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,

            /* ================= USER ================= */
            'name' => $this->user?->name,
            'email' => $this->user?->email,

            /* ================= PROFILE ================= */
            'profile_image' => $this->profile_image,
            'bio' => $this->bio,
            'expertise' => $this->expertise,

            /* ================= JSON ================= */
            'languages' => $this->languages ?? [],
            'skills' => $this->skills ?? [],
            'gallery' => $this->gallery ?? [],

            /* ================= BUSINESS ================= */
            'experience' => $this->experience,
            'price_per_minute' => $this->price_per_minute,

            /* ================= STATUS ================= */
            'is_online' => (bool) $this->is_online,
            'is_verified' => (bool) $this->is_verified,

            /* ================= RATING ================= */
            'rating' => (float) $this->rating,
            'total_reviews' => (int) $this->total_reviews,
        ];
    }
}
