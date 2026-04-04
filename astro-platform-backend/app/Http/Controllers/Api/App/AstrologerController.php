<?php
// PATH: app/Http/Controllers/Api/App/AstrologerController.php
// FIX: service->list($request) → service->publicList($request->all())
//      Pagination meta format fix: meta.pagination structure

namespace App\Http\Controllers\Api\App;

use App\Http\Controllers\Controller;
use App\Http\Resources\AstroResource;
use App\Services\App\AstrologerService;
use Illuminate\Http\Request;

class AstrologerController extends Controller
{
    public function __construct(
        protected AstrologerService $service
    ) {}

    public function index(Request $request)
    {
        $astrologers = $this->service->publicList($request->all());

        return $this->success(
            'Astrologers fetched',
            AstroResource::collection($astrologers),
            [
                'pagination' => [
                    'current_page' => $astrologers->currentPage(),
                    'last_page'    => $astrologers->lastPage(),
                    'per_page'     => $astrologers->perPage(),
                    'total'        => $astrologers->total(),
                ],
            ]
        );
    }

    public function show(int $id)
    {
        $astrologer = $this->service->findPublic($id);
        return $this->success('Astrologer detail', new AstroResource($astrologer));
    }

    public function reviews(int $id)
    {
        // ReviewService inject karo agar use karna ho
        // Abhi empty return
        return $this->success('Reviews fetched', []);
    }

    public function submitReview(Request $request, int $id)
    {
        return $this->success('Review submitted', []);
    }
}