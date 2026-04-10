<?php
// PATH: app/Features/Astrologer/Controllers/UserAstrologerController.php
// IMPROVED: submitReview() — enforce completed consultation check
// IMPROVED: Pagination::meta() properly used

namespace App\Features\Astrologer\Controllers;

use App\Features\Astrologer\Queries\AstrologerQuery;
use App\Features\Astrologer\Resources\AstrologerResource;
use App\Features\Astrologer\Services\AstrologerService;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Astrologer;
use App\Models\Consultation;
use App\Services\App\ReviewService;
use App\Support\Pagination;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAstrologerController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AstrologerService $astrologerService,
        protected ReviewService     $reviewService,
    ) {}

    /* ── GET /astrologers ───────────────────────── */
    public function index(Request $request): JsonResponse
    {
        $filters   = $request->only([
            'online', 'expertise', 'language', 'min_price', 'max_price',
            'min_rating', 'consultation_type', 'sort', 'search', 'page',
        ]);
        $paginator = $this->astrologerService->publicList($filters);

        return $this->success(
            'Astrologers fetched',
            AstrologerResource::collection($paginator),
            ['pagination' => Pagination::meta($paginator)]
        );
    }

    /* ── GET /astrologers/{id} ──────────────────── */
    public function show(int $id): JsonResponse
    {
        $astrologer = $this->astrologerService->findPublic($id);
        return $this->success('Astrologer fetched', new AstrologerResource($astrologer));
    }

    /* ── GET /astrologers/{id}/reviews ─────────── */
    public function reviews(Request $request, int $id): JsonResponse
    {
        $astrologer = Astrologer::findOrFail($id);
        $page       = (int) $request->query('page', 1);
        $paginator  = $this->reviewService->forAstrologer($astrologer, $page);

        return $this->success(
            'Reviews fetched',
            ReviewResource::collection($paginator),
            ['pagination' => Pagination::meta($paginator)]
        );
    }

    /* ── POST /astrologers/{id}/reviews ─────────── */
    public function submitReview(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'rating'  => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $astrologer = Astrologer::findOrFail($id);
        $user       = $request->user();

        // ENFORCE: Only completed consultations allow reviews
        $hasCompleted = Consultation::where('user_id',       $user->id)
            ->where('astrologer_id', $astrologer->id)
            ->where('status',        'completed')
            ->exists();

        if (!$hasCompleted) {
            return $this->error(
                'Sirf completed consultation ke baad hi review de sakte hain.',
                422
            );
        }

        $review = $this->reviewService->submit($user, $astrologer, $data);

        return $this->success('Review submitted successfully', new ReviewResource($review), [], 201);
    }
}
