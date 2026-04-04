<?php
// PATH: app/DTO/AstrologerData.php
// FIX: Unsafe parsing hata di, proper type casting add kiya
//      toArray() method add kiya — fillable ke liye
//      fromRequest() helper add kiya — Controller mein clean usage ke liye

namespace App\DTO;

use Illuminate\Http\Request;

class AstrologerData
{
    public function __construct(
        public int     $user_id,
        public ?string $bio               = null,
        public ?string $expertise         = null,
        public ?int    $experience        = null,
        public ?float  $price_per_minute  = null,
        public ?string $consultation_type = null,
        public ?array  $languages         = null,
        public ?array  $skills            = null,
        public ?string $profile_image     = null,
        public ?array  $gallery           = null,
        public ?bool   $is_available      = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            user_id:           (int)    ($data['user_id']                           ?? 0),
            bio:                          $data['bio']               ?? null,
            expertise:                    $data['expertise']         ?? null,
            experience:        isset($data['experience'])        ? (int)   $data['experience']        : null,
            price_per_minute:  isset($data['price_per_minute'])  ? (float) $data['price_per_minute']  : null,
            consultation_type:             $data['consultation_type'] ?? null,
            languages:         isset($data['languages'])         ? (array) $data['languages']         : null,
            skills:            isset($data['skills'])            ? (array) $data['skills']            : null,
            profile_image:                 $data['profile_image']     ?? null,
            gallery:           isset($data['gallery'])           ? (array) $data['gallery']           : null,
            is_available:      isset($data['is_available'])      ? (bool)  $data['is_available']      : null,
        );
    }

    /**
     * Controller mein use karo:
     *   $dto = AstrologerData::fromRequest($request, $user->id);
     */
    public static function fromRequest(Request $request, int $userId): self
    {
        return self::fromArray(
            array_merge($request->validated(), ['user_id' => $userId])
        );
    }

    /** Eloquent create()/update() ke liye — null values skip */
    public function toArray(): array
    {
        return array_filter([
            'user_id'           => $this->user_id,
            'bio'               => $this->bio,
            'expertise'         => $this->expertise,
            'experience'        => $this->experience,
            'price_per_minute'  => $this->price_per_minute,
            'consultation_type' => $this->consultation_type,
            'languages'         => $this->languages,
            'skills'            => $this->skills,
            'profile_image'     => $this->profile_image,
            'gallery'           => $this->gallery,
            'is_available'      => $this->is_available,
        ], fn($v) => $v !== null);
    }
}