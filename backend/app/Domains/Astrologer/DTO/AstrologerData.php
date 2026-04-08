<?php

namespace App\Domains\Astrologer\DTO;

class AstrologerData
{
    public function __construct(
        public string $name,
        public string $email,
        public int $experience,
        public float $price_per_minute,
        public ?string $bio,
        public ?string $expertise,
        public array $languages,
        public array $skills,
        public string $consultation_type,
        public ?string $profile_image,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            experience: $data['experience'] ?? 0,
            price_per_minute: $data['price_per_minute'] ?? 0,
            bio: $data['bio'] ?? null,
            expertise: $data['expertise'] ?? null,
            languages: $data['languages'] ?? [],
            skills: $data['skills'] ?? [],
            consultation_type: $data['consultation_type'] ?? 'all',
            profile_image: $data['profile_image'] ?? null,
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}