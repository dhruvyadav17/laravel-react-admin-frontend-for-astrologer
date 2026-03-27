<?php

namespace App\DTO;

class UserData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $password = null,
        public ?int $experience = null,
        public ?float $price_per_minute = null,
        public ?string $bio = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'] ?? null,
            experience: $data['experience'] ?? null,
            price_per_minute: $data['price_per_minute'] ?? null,
            bio: $data['bio'] ?? null,
        );
    }
}