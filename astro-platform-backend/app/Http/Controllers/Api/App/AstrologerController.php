<?php

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
        $astrologers = $this->service->list($request);

        return $this->success(
            'Astrologers fetched successfully',
            AstroResource::collection($astrologers),
            [
                'pagination' => [
                    'current_page' => $astrologers->currentPage(),
                    'last_page' => $astrologers->lastPage(),
                    'per_page' => $astrologers->perPage(),
                    'total' => $astrologers->total(),
                ],
            ]
        );
    }

    /* ================= DETAIL ================= */

    public function show($id)
    {
        $user = $this->service->find($id);

        return $this->success(
            'Astrologer detail',
            new AstroResource($user)
        );
    }
}
