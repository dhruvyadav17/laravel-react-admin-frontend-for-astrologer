<?php
// PATH: app/Services/App/ReviewService.php
// FIX BUG-4: ReviewService extend karta tha BaseService lekin kabhi model() implement nahi kiya
//             aur constructor mein parent call nahi tha — design mismatch tha
//             FIX: BaseService extend karna remove kiya (ReviewService ka restore/delete logic
//             alag hai — wo sirf submit+list karta hai, BaseService ki zaroorat nahi)
// IMPROVEMENT: forAstrologer() mein paginate ke saath page param support add kiya

namespace App\Services\App;

use App\Models\AstrologerReview;
use Illuminate\Support\Facades\DB;
use App\Features\Astrologer\Services\AstrologerService;

class ReviewService
{
    public function __construct(
        protected AstrologerService $astrologerService
    ) {}

    /* ── Submit or Update review ────────────────────── */
    public function submit(int $userId, int $astrologerId, array $data): AstrologerReview
    {
        return DB::transaction(function () use ($userId, $astrologerId, $data) {

            $review = AstrologerReview::updateOrCreate(
                [
                    'user_id'       => $userId,
                    'astrologer_id' => $astrologerId,
                ],
                [
                    'rating'  => $data['rating'],
                    'comment' => $data['comment'] ?? null,
                ]
            );

            // Rating recalculate karo har review ke baad
            $astrologer = \App\Models\Astrologer::findOrFail($astrologerId);
            $this->astrologerService->recalculateRating($astrologer);

            return $review;
        });
    }

    /* ── List approved reviews for an astrologer ────── */
    public function forAstrologer(int $astrologerId, int $perPage = 10)
    {
        return AstrologerReview::with('user:id,name,profile_image')
            ->where('astrologer_id', $astrologerId)
            ->where('is_approved', true)
            ->latest()
            ->paginate($perPage);
    }
}
