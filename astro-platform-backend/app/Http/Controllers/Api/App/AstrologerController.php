<?php
// PATH: app/Http/Controllers/Api/App/AstrologerController.php
// UPDATE: reviews() + submitReview() endpoints ADD kiye
// REASON: Public reviews fetch aur submit karne ke liye endpoints missing the

namespace App\Http\Controllers\Api\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\AstroResource;
use App\Http\Resources\ReviewResource;
use App\Services\App\AstrologerService;
use App\Services\App\ReviewService;
use Illuminate\Http\Request;

class AstrologerController extends Controller
{
    public function __construct(
        protected AstrologerService $service,
        protected ReviewService     $reviewService,
    ) {}

    public function index(Request $request)
    {
        $list = $this->service->publicList(
            $request->only(['online','expertise','language','min_price',
                            'max_price','min_rating','consultation_type','sort'])
        );
        return $this->success('Astrologers fetched', AstroResource::collection($list));
    }

    public function show(int $id)
    {
        $astrologer = $this->service->findPublic($id);
        return $this->success('Astrologer detail', new AstroResource($astrologer));
    }

    // NEW: Public reviews for an astrologer
    public function reviews(int $id)
    {
        $reviews = $this->reviewService->forAstrologer($id);
        return $this->success('Reviews fetched', ReviewResource::collection($reviews));
    }

    // NEW: Submit review (auth + role:user required)
    public function submitReview(ReviewRequest $request, int $id)
    {
        $review = $this->reviewService->submit(
            $request->user()->id, $id, $request->validated()
        );
        return $this->success('Review submitted', new ReviewResource($review), [], 201);
    }
}