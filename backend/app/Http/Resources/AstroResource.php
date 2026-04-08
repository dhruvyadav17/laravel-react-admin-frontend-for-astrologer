<?php
// PATH: app/Http/Resources/AstroResource.php
// UPDATE: is_available, consultation_type, total_consultations, schedules (whenLoaded) add kiye
// REASON: New model fields API response mein nahi aa rahe the

namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class AstroResource extends JsonResource
{
    public function toArray($request): array
    {
        $user = $this->user;
        return [
            'id'                  => $this->id,
            'user_id'             => $this->user_id,
            'name'                => $user?->name,
            'email'               => $user?->email,
            'profile_image'       => $this->profile_image ?? $user?->profile_image,
            'experience'          => $this->experience,
            'price_per_minute'    => $this->price_per_minute,
            'bio'                 => $this->bio,
            'expertise'           => $this->expertise,
            'languages'           => $this->languages     ?? [],
            'skills'              => $this->skills        ?? [],
            'consultation_type'   => $this->consultation_type,   // NEW
            'rating'              => round((float)$this->rating, 2),
            'total_reviews'       => $this->total_reviews,
            'total_consultations' => $this->total_consultations ?? 0, // NEW
            'is_online'           => (bool)$this->is_online,
            'is_available'        => (bool)$this->is_available,  // NEW
            'is_verified'         => (bool)$this->is_verified,
            'gallery'             => $this->gallery ?? [],
            'schedules'           => $this->whenLoaded('schedules'), // NEW
            'created_at'          => $this->created_at?->toDateString(),
            'deleted_at'          => $this->deleted_at?->toDateString(),
            // Admin-only field
            'user_is_active'      => $this->when(
                request()->routeIs('admin.*'),
                fn() => (bool)$user?->is_active
            ),
        ];
    }
}