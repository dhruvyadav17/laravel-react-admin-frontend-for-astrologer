<?php

namespace App\Services\App;

use App\Models\User;
use Illuminate\Http\Request;

class AstrologerService
{
    /* ================= LIST ================= */

    public function list(Request $request): array
    {
        $query = User::query()
            ->role('astrologer')
            ->where('is_active', true);

        /* ===== SEARCH ===== */
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        /* ===== FILTER ===== */
        if ($request->filled('min_price')) {
            $query->where('price_per_minute', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price_per_minute', '<=', $request->max_price);
        }

        if ($request->filled('min_experience')) {
            $query->where('experience', '>=', $request->min_experience);
        }

        /* ===== SORT ===== */
        if ($request->filled('sort')) {
            match ($request->sort) {
                'price_low'  => $query->orderBy('price_per_minute', 'asc'),
                'price_high' => $query->orderBy('price_per_minute', 'desc'),
                'rating'     => $query->orderBy('rating', 'desc'),
                'experience' => $query->orderBy('experience', 'desc'),
                default      => $query->latest(),
            };
        } else {
            $query->latest();
        }

        /* ===== SELECT (OPTIMIZATION) ===== */
        $query->select([
            'id',
            'name',
            'email',
            'profile_image',
            'experience',
            'price_per_minute',
            'rating',
            'total_reviews',
            'is_online',
        ]);

        /* ===== PAGINATION ===== */
        $astrologers = $query->paginate(10);

        return [
            'data' => $astrologers,
            'meta' => [
                'current_page' => $astrologers->currentPage(),
                'last_page'    => $astrologers->lastPage(),
                'total'        => $astrologers->total(),
            ],
        ];
    }

    /* ================= DETAIL ================= */

    public function detail(User $user): ?User
    {
        if (! $user->hasRole('astrologer')) {
            return null;
        }

        return $user->loadMissing([
            'roles',
            'permissions',
        ]);
    }
}