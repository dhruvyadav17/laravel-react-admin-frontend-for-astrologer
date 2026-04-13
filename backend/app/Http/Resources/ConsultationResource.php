<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'type'             => $this->type,
            'status'           => $this->status,
            'user_note'        => $this->user_note,
            'rejection_reason' => $this->rejection_reason,
            'rate_per_minute'  => $this->rate_per_minute,
            'total_amount'     => $this->total_amount,
            'duration_minutes' => $this->duration_minutes,
            'started_at'       => $this->started_at?->toISOString(),
            'ended_at'         => $this->ended_at?->toISOString(),
            'created_at'       => $this->created_at->diffForHumans(),

            // WebRTC fields
            'room_id'          => $this->room_id,
            'call_status'      => $this->call_status,

            'user' => $this->whenLoaded('user', fn() => [
                'id'            => $this->user->id,
                'name'          => $this->user->name,
                'profile_image' => $this->user->profile_image,
            ]),

            'astrologer' => $this->whenLoaded('astrologer', fn() => [
                'id'               => $this->astrologer->id,
                'name'             => $this->astrologer->name,
                'profile_image'    => $this->astrologer->profile_image,
                'price_per_minute' => $this->astrologer->price_per_minute,
                'expertise'        => $this->astrologer->expertise,
            ]),
        ];
    }
}
