<?php

namespace App\Services\App;

use App\Models\Astrologer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AstrologerService
{
    /* ================= ADMIN ================= */

    public function adminList()
    {
        return Astrologer::with('user')->latest()->get();
    }

    public function create(array $data)
    {
        return Astrologer::create($data);
    }

    public function update(Astrologer $astro, array $data)
    {
        $astro->update($data);
        return $astro;
    }

    public function delete(Astrologer $astro)
    {
        $astro->delete();
    }

    /* ================= USER ================= */

    public function list(Request $request)
    {
        $cacheKey = 'astrologers_' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, 60, function () use ($request) {

            return Astrologer::with('user')

                /* 🔍 SEARCH */
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->whereHas('user', function ($sub) use ($request) {
                        $sub->where('name', 'like', "%{$request->search}%");
                    });
                })

                /* 🔥 FILTERS */
                ->when($request->filled('skill'), function ($q) use ($request) {
                    $q->whereJsonContains('skills', $request->skill);
                })

                ->when($request->filled('language'), function ($q) use ($request) {
                    $q->whereJsonContains('languages', $request->language);
                })

                /* SORT */
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