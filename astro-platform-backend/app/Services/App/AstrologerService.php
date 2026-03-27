<?php

namespace App\Services\App;

use App\Models\User;
use Illuminate\Http\Request;

class AstrologerService
{
    /**
     * Base Query (Reusable 🔥)
     */
    protected function baseQuery()
    {
        return User::query()
            ->select([
                'id',
                'name',
                'profile_image',
                'experience',
                'price_per_minute',
                'rating',
                'total_reviews',
                'languages',
                'skills',
                'bio',
            ])
            ->astrologers();
    }

    /**
     * List astrologers
     */
    public function list(Request $request)
    {
        return $this->baseQuery()

            // 🔍 SEARCH (SAFE + GROUPED)
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where(function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                });
            })

            // 🔽 SORTING
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

            // 📄 PAGINATION
            ->paginate($request->per_page ?? 10);
    }

    /**
     * Single astrologer
     */
    public function find($id)
    {
        return $this->baseQuery()
            ->findOrFail($id);
    }
}