<?php
// PATH: app/DTO/AstrologerData.php
// NEW FILE — UserData se astrologer fields alag kiye (Separation of Concerns)
// REASON: UserData mein experience/bio/price_per_minute galat tha

namespace App\DTO;

class AstrologerData
{
    public function __construct(
        public int    $user_id,
        public int    $experience,
        public float  $price_per_minute,
        public string $bio,
        public string $expertise,
        public array  $languages         = [],
        public array  $skills            = [],
        public string $consultation_type = 'all',
        public ?string $profile_image    = null,
        public ?array  $gallery          = null,
    ) {}

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            user_id:           $userId,
            experience:        (int)   $data['experience'],
            price_per_minute:  (float) $data['price_per_minute'],
            bio:               $data['bio'],
            expertise:         $data['expertise'],
            languages:         $data['languages']          ?? [],
            skills:            $data['skills']             ?? [],
            consultation_type: $data['consultation_type']  ?? 'all',
            profile_image:     $data['profile_image']      ?? null,
            gallery:           $data['gallery']            ?? [],
        );
    }
}