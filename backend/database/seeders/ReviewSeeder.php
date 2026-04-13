<?php
// Creates realistic approved reviews for all seeded astrologers
// Recalculates actual rating/total_reviews from real review records

namespace Database\Seeders;

use App\Models\AstrologerReview;
use App\Models\Astrologer;
use App\Models\User;
use App\Services\App\ReviewService;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function __construct(protected ReviewService $reviewService) {}

    public function run(): void
    {
        $users = User::role('user')->get();
        if ($users->isEmpty()) {
            $this->command->warn('No users found -- skipping ReviewSeeder');
            return;
        }

        $astrologers = Astrologer::with('user')->get();

        $reviewTexts = [
            5 => [
                'Absolutely amazing session! Predictions were incredibly accurate. Highly recommend.',
                'Best astrologer I have consulted. Clear, detailed and insightful guidance.',
                'Extremely knowledgeable. This session completely changed my perspective.',
                'Very precise and helpful. Will definitely consult again!',
                'Fantastic experience. Knew things no one else could have predicted.',
                'Very calm, clear and accurate. Felt like talking to a wise guide.',
            ],
            4 => [
                'Good session overall. Several predictions were quite accurate.',
                'Helpful and knowledgeable astrologer. Slight delay in response.',
                'Pretty accurate reading. Would recommend to friends and family.',
                'Satisfying experience. A few areas could use more depth.',
                'Decent reading. Overall happy with the consultation.',
            ],
            3 => [
                'Average session. Some things were accurate, others not so much.',
                'Okay experience. Could have been more specific and detailed.',
                'Decent enough but expected more depth for the price.',
            ],
        ];

        // Distribution weighted toward 4-5 stars
        $ratingPool = [5, 5, 5, 4, 4, 4, 4, 3];

        foreach ($astrologers as $astrologer) {
            $reviewCount = rand(3, 7);
            $usedUserIds = [];

            for ($i = 0; $i < $reviewCount; $i++) {
                $available = $users->whereNotIn('id', $usedUserIds)->values();
                if ($available->isEmpty()) break;

                $user          = $available->random();
                $usedUserIds[] = $user->id;
                $rating        = $ratingPool[array_rand($ratingPool)];
                $texts         = $reviewTexts[$rating];

                AstrologerReview::updateOrCreate(
                    ['user_id' => $user->id, 'astrologer_id' => $astrologer->id],
                    [
                        'rating'      => $rating,
                        'comment'     => $texts[array_rand($texts)],
                        'is_approved' => true,
                    ]
                );
            }

            // Recalculate rating/total_reviews from actual review records
            $this->reviewService->recalculate($astrologer);
        }

        $this->command->info('Reviews seeded for ' . $astrologers->count() . ' astrologers.');
    }
}
