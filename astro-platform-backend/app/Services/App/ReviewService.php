<?php
// PATH: app/Services/App/ReviewService.php
// NEW FILE — Review submit aur listing logic
// REASON: Ye logic kahi nahi tha

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\AstrologerReview;
use App\Services\BaseService;
use Illuminate\Support\Facades\DB;

class ReviewService extends BaseService
{
    public function __construct(protected AstrologerService $astrologerService) {}

    protected function model(): string { return AstrologerReview::class; }

    public function submit(int $userId, int $astrologerId, array $data): AstrologerReview
    {
        return DB::transaction(function () use ($userId, $astrologerId, $data) {
            $review = AstrologerReview::updateOrCreate(
                ['user_id' => $userId, 'astrologer_id' => $astrologerId],
                ['rating' => $data['rating'], 'comment' => $data['comment'] ?? null]
            );

            // Rating recalculate after every review
            $astrologer = Astrologer::findOrFail($astrologerId);
            $this->astrologerService->recalculateRating($astrologer);

            return $review;
        });
    }

    public function forAstrologer(int $astrologerId)
    {
        return AstrologerReview::with('user:id,name,profile_image')
            ->where('astrologer_id', $astrologerId)
            ->where('is_approved', true)
            ->latest()
            ->paginate(10);
    }
}