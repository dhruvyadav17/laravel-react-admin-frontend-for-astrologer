<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Astrologer;
use App\Http\Requests\AstrologerRequest;
use App\Http\Resources\AstroResource;
use App\Services\App\AstrologerService;

class AstrologerController extends Controller
{
    public function __construct(
        protected AstrologerService $service
    ) {}

    public function index()
    {
        return $this->success(
            'Astrologers list',
            AstroResource::collection(
                $this->service->adminList()
            )
        );
    }

    public function store(AstrologerRequest $request)
    {
        $astro = $this->service->create($request->validated());

        return $this->success('Created', new AstroResource($astro));
    }

    public function update(AstrologerRequest $request, Astrologer $astrologer)
    {
        $astro = $this->service->update($astrologer, $request->validated());

        return $this->success('Updated', new AstroResource($astro));
    }

    public function destroy(Astrologer $astrologer)
    {
        $this->service->delete($astrologer);

        return $this->success('Deleted');
    }
}