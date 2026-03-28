<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Astrologer;
use App\Http\Requests\AstrologerRequest;
use App\Http\Resources\AstroResource;

class AstrologerController extends Controller
{
    public function index()
    {
        return $this->success(
            'Astrologers list',
            AstroResource::collection(
                Astrologer::with('user')->latest()->get()
            )
        );
    }

    public function store(AstrologerRequest $request)
    {
        $astro = Astrologer::create($request->validated());

        return $this->success('Created', new AstroResource($astro));
    }

    public function update(AstrologerRequest $request, Astrologer $astrologer)
    {
        $astrologer->update($request->validated());

        return $this->success('Updated', new AstroResource($astrologer));
    }

    public function destroy(Astrologer $astrologer)
    {
        $astrologer->delete();

        return $this->success('Deleted');
    }
}