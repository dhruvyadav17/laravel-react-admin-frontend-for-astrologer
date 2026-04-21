<?php

namespace App\Domains\Astrologer\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'rating'     => $this->rating,
            'comment'    => $this->comment,
            'created_at' => $this->created_at->diffForHumans(),
            'user'       => [
                'id'            => $this->user->id,
                'name'          => $this->user->name,
                'profile_image' => $this->user->profile_image,
            ],
        ];
    }
}
