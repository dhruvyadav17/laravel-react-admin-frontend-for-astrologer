<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AstroResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            /* ================= BASIC ================= */

            'id' => $this->id,
            'name' => $this->name,

            // 🔥 only if loaded (safe)
            'email' => $this->when(isset($this->email), $this->email),

            /* ================= PROFILE ================= */

            'profile_image' => $this->profile_image,
            'bio' => $this->bio,

            'expertise' => $this->when(
                isset($this->expertise),
                $this->expertise
            ),

            /* ================= JSON FIELDS ================= */

            'languages' => $this->when(
                isset($this->languages),
                $this->languages ?? []
            ),

            'skills' => $this->when(
                isset($this->skills),
                $this->skills ?? []
            ),

            'gallery' => $this->when(
                isset($this->gallery),
                $this->gallery ?? []
            ),

            /* ================= BUSINESS ================= */

            'experience' => $this->experience,
            'price_per_minute' => $this->price_per_minute,

            /* ================= STATUS ================= */

            'is_verified' => $this->when(
                isset($this->is_verified),
                (bool) $this->is_verified
            ),

            'is_online' => $this->when(
                isset($this->is_online),
                (bool) $this->is_online
            ),

            /* ================= RATING ================= */

            'rating' => (float) $this->rating,
            'total_reviews' => (int) $this->total_reviews,

            /* ================= RELATIONS ================= */

            'roles' => $this->whenLoaded(
                'roles',
                fn () => $this->roles->pluck('name')->values()
            ),

            /* ================= OPTIONAL ================= */

            'deleted_at' => $this->when(
                isset($this->deleted_at),
                $this->deleted_at
            ),

            /* ================= FUTURE READY ================= */

            'reviews' => $this->whenLoaded('reviews', fn () =>
                $this->reviews->map(fn ($r) => [
                    'name' => $r->user->name ?? 'User',
                    'rating' => (int) $r->rating,
                    'text' => $r->comment,
                ])
            ),
        ];
    }
}