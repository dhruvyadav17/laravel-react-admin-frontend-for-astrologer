<?php
/**
 * Admin ReviewController — moderate user reviews.
 * GET  /admin/reviews            — all reviews with filters
 * POST /admin/reviews/{id}/approve — approve
 * POST /admin/reviews/{id}/reject  — reject (soft delete)
 */

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AstrologerReview;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviewService) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending'); // pending | approved | rejected | all

        $query = AstrologerReview::with([
            'user:id,name,profile_image',
            'astrologer:id,user_id',
            'astrologer.user:id,name',
        ])->latest();

        match($status) {
            'pending'  => $query->where('is_approved', false)->whereNull('deleted_at'),
            'approved' => $query->where('is_approved', true)->whereNull('deleted_at'),
            'rejected' => $query->onlyTrashed(),
            default    => $query->withTrashed(),
        };

        $paginator = $query->paginate(20);

        $data = $paginator->getCollection()->map(fn($r) => [
            'id'           => $r->id,
            'rating'       => $r->rating,
            'comment'      => $r->comment,
            'is_approved'  => $r->is_approved,
            'is_rejected'  => !is_null($r->deleted_at),
            'created_at'   => $r->created_at->diffForHumans(),
            'user'         => ['id' => $r->user?->id, 'name' => $r->user?->name],
            'astrologer'   => ['id' => $r->astrologer?->id, 'name' => $r->astrologer?->user?->name],
        ]);

        $summary = [
            'pending'  => AstrologerReview::where('is_approved', false)->whereNull('deleted_at')->count(),
            'approved' => AstrologerReview::where('is_approved', true)->whereNull('deleted_at')->count(),
            'rejected' => AstrologerReview::onlyTrashed()->count(),
            'total'    => AstrologerReview::withTrashed()->count(),
        ];

        return $this->success('Reviews', $data, [
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
            'summary' => $summary,
        ]);
    }

    public function approve(int $id): JsonResponse
    {
        $review = AstrologerReview::withTrashed()->findOrFail($id);
        $review->restore(); // un-soft-delete if rejected
        $review->update(['is_approved' => true]);
        $this->reviewService->recalculate($review->astrologer);
        return $this->success('Review approved — rating updated.');
    }

    public function reject(int $id): JsonResponse
    {
        $review = AstrologerReview::where('id', $id)->firstOrFail();
        $review->update(['is_approved' => false]);
        $review->delete(); // soft delete
        $this->reviewService->recalculate($review->astrologer);
        return $this->success('Review rejected and hidden.');
    }
}
