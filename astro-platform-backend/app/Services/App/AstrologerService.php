<?php

namespace App\Services\App;

use App\Models\Astrologer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AstrologerService
{
    public function list(Request $request)
    {
        $cacheKey = 'astrologers_' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, 60, function () use ($request) {

            return Astrologer::with('user')

                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->whereHas('user', function ($sub) use ($request) {
                        $sub->where('name', 'like', "%{$request->search}%");
                    });
                })

                ->when(
                    $request->sort_by === 'price',
                    fn($q) => $q->orderBy('price_per_minute')
                )

                ->when(
                    $request->sort_by === 'experience',
                    fn($q) => $q->orderByDesc('experience')
                )

                ->when(
                    !$request->sort_by,
                    fn($q) => $q->orderByDesc('rating')
                )

                ->paginate($request->per_page ?? 10);
        });
    }

    public function find($id)
    {
        return Astrologer::with('user')->findOrFail($id);
    }
}