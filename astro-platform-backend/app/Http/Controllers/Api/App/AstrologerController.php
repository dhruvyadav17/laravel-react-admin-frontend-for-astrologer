<?php
// PATH: app/Http/Controllers/Api/App/AstrologerController.php
// FIX BUG-1: reviews() aur submitReview() empty stubs the — ReviewService inject kiya
//             pagination meta add kiya public index() mein bhi (consistent format)
// BEFORE: reviews() → always [] | submitReview() → nothing saved
// AFTER:  reviews() → paginated reviews | submitReview() → saves via ReviewService

namespace App\Http\Controllers\Api\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\AstroResource;
use App\Http\Resources\ReviewResource;
use App\Services\App\AstrologerService;
use App\Services\App\ReviewService;
use App\Support\Pagination;
use Illuminate\Http\Request;

class AstrologerController extends Controller
{
    public function __construct(
        protected AstrologerService $service,
        protected ReviewService     $reviewService,   // FIX: inject kiya
    ) {}

    /* ── Public listing ─────────────────────────────── */
    public function index(Request $request)
    {
        $astrologers = $this->service->publicList($request->all());

        return $this->success(
            'Astrologers fetched',
            AstroResource::collection($astrologers),
            ['pagination' => Pagination::meta($astrologers)]  // consistent format
        );
    }

    /* ── Public single ──────────────────────────────── */
    public function show(int $id)
    {
        $astrologer = $this->service->findPublic($id);
        return $this->success('Astrologer detail', new AstroResource($astrologer));
    }

    /* ── Public reviews (GET) ───────────────────────── */
    // FIX BUG-1: Pehle always [] return karta tha — ab real data fetch karta hai
    public function reviews(int $id)
    {
        $reviews = $this->reviewService->forAstrologer($id);

        return $this->success(
            'Reviews fetched',
            ReviewResource::collection($reviews),
            ['pagination' => Pagination::meta($reviews)]
        );
    }

    /* ── Submit review (POST, auth + role:user) ─────── */
    // FIX BUG-1: Pehle nothing saved — ab ReviewService::submit() call karta hai
    public function submitReview(ReviewRequest $request, int $id)
    {
        $review = $this->reviewService->submit(
            userId:       $request->user()->id,
            astrologerId: $id,
            data:         $request->validated(),
        );

        return $this->success(
            'Review submitted successfully',
            new ReviewResource($review->load('user')),
            [],
            201
        );
    }
}
