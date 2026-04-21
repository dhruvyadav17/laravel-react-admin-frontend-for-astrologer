<?php
// FIX B7: submit() signature mismatch -- controllers User/Astrologer objects pass karte hain
// FIX B8: Added is_approved filter in recalculate() -- unapproved reviews no longer affect rating

namespace App\Services;

use App\Domains\Astrologer\Services\AstrologerService;
use App\Models\Astrologer;
use App\Models\AstrologerReview;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function __construct(
        protected AstrologerService $astrologerService
    ) {}

    public function submit(User $user, Astrologer $astrologer, array $data): AstrologerReview
    {
        return DB::transaction(function () use ($user, $astrologer, $data) {
            $review = AstrologerReview::updateOrCreate(
                [
                    'user_id'       => $user->id,
                    'astrologer_id' => $astrologer->id,
                ],
                [
                    'rating'  => $data['rating'],
                    'comment' => $data['comment'] ?? null,
                ]
            );

            $this->recalculate($astrologer);

            return $review->load('user:id,name,profile_image');
        });
    }

    public function forAstrologer(Astrologer $astrologer, int $page = 1, int $perPage = 10)
    {
        return AstrologerReview::with('user:id,name,profile_image')
            ->where('astrologer_id', $astrologer->id)
            ->where('is_approved', true)
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function myReviews(Astrologer $astrologer, int $page = 1, int $perPage = 10)
    {
        return AstrologerReview::with('user:id,name,profile_image')
            ->where('astrologer_id', $astrologer->id)
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);
    }

    // FIX B8: Only approved reviews count in rating
    public function recalculate(Astrologer $astrologer): void
    {
        $approved = $astrologer->reviews()->where('is_approved', true);

        $astrologer->update([
            'rating'        => round((float) ($approved->avg('rating') ?? 0), 1),
            'total_reviews' => $approved->count(),
        ]);
    }
}
