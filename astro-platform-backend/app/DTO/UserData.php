<?php
// PATH: app/DTO/UserData.php
// FIX: experience, price_per_minute, bio hata diye
//      Ye fields AstrologerData mein hone chahiye — UserData mein nahi
//      UserData = sirf user authentication info

namespace App\DTO;

class UserData
{
    public function __construct(
        public string  $name,
        public string  $email,
        public ?string $password = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name:     $data['name'],
            email:    $data['email'],
            password: $data['password'] ?? null,
        );
    }
}