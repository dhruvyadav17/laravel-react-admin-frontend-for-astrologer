<?php
// Generates realistic astrologer test data for seeding

namespace Database\Factories;

use App\Models\Astrologer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AstrologerFactory extends Factory
{
    protected $model = Astrologer::class;

    private static array $expertise = [
        'Vedic Astrology','KP Astrology','Numerology','Tarot Reading',
        'Vastu Shastra','Palmistry','Lal Kitab','Nadi Astrology',
    ];

    private static array $languages = [
        'Hindi','English','Tamil','Telugu','Marathi','Bengali','Gujarati','Kannada',
    ];

    private static array $skills = [
        'Kundli','Match Making','Career','Finance','Health','Love','Marriage','Education','Business',
    ];

    public function definition(): array
    {
        return [
            'user_id'             => User::factory()->astrologer(),
            'experience'          => $this->faker->numberBetween(1, 20),
            'price_per_minute'    => $this->faker->randomFloat(0, 5, 200),
            'bio'                 => $this->faker->paragraph(3),
            'expertise'           => $this->faker->randomElement(self::$expertise),
            'languages'           => $this->faker->randomElements(self::$languages, rand(1, 3)),
            'skills'              => $this->faker->randomElements(self::$skills, rand(2, 5)),
            'consultation_type'   => $this->faker->randomElement(['chat','call','video','all']),
            'rating'              => $this->faker->randomFloat(1, 3.0, 5.0),
            'total_reviews'       => $this->faker->numberBetween(0, 500),
            'total_consultations' => $this->faker->numberBetween(0, 1000),
            'is_online'           => $this->faker->boolean(30),
            'is_available'        => $this->faker->boolean(60),
            'is_verified'         => true,
            'profile_image'       => 'https://i.pravatar.cc/150?u='.$this->faker->unique()->userName(),
            'gallery'             => [],
        ];
    }

    /** Override: online + available */
    public function online(): static
    {
        return $this->state(['is_online' => true, 'is_available' => true]);
    }

    /** Override: high rating */
    public function topRated(): static
    {
        return $this->state([
            'rating'        => $this->faker->randomFloat(1, 4.5, 5.0),
            'total_reviews' => $this->faker->numberBetween(100, 500),
        ]);
    }
}