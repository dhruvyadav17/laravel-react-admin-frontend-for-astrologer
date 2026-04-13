<?php

namespace App\Features\Astrologer\Queries;

use App\Models\Astrologer;
use Illuminate\Database\Eloquent\Builder;

class AstrologerQuery
{
    /* -- Public listing --------------------------------------- */
    public function publicList(array $filters = []): Builder
    {
        $query = Astrologer::query()
            ->with('user:id,name,profile_image,email')  // N+1 FIX
            ->where('is_verified', true)
            ->whereNull('deleted_at')
            ->whereHas('user', fn ($q) => $q->where('is_active', true));

        // 1. Search: name (user) + expertise + bio
        if ($search = trim($filters['search'] ?? '')) {
            $like = "%{$search}%";
            $query->where(function (Builder $q) use ($like) {
                $q->where('expertise', 'like', $like)
                  ->orWhere('bio', 'like', $like)
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $like));
            });
        }

        // 2. Online only
        if (!empty($filters['online'])) {
            $query->where('is_online', true)->where('is_available', true);
        }

        // 3. Language -- search within JSON array
        if ($lang = trim($filters['language'] ?? '')) {
            $query->where(function (Builder $q) use ($lang) {
                $q->whereRaw('JSON_CONTAINS(LOWER(languages), ?)', [json_encode(strtolower($lang))])
                  ->orWhere('languages', 'like', "%{$lang}%"); // SQLite fallback
            });
        }

        // 4. Price range
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $query->where('price_per_minute', '>=', (float) $filters['min_price']);
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $query->where('price_per_minute', '<=', (float) $filters['max_price']);
        }

        // 5. Min rating
        if (isset($filters['min_rating']) && is_numeric($filters['min_rating'])) {
            $query->where('rating', '>=', (float) $filters['min_rating']);
        }

        // 6. Consultation type -- astrologers with 'all' appear in every filter
        if (!empty($filters['consultation_type']) && $filters['consultation_type'] !== 'all') {
            $type = $filters['consultation_type'];
            $query->where(function (Builder $q) use ($type) {
                $q->where('consultation_type', $type)
                  ->orWhere('consultation_type', 'all');
            });
        }

        // 7. Sorting -- previously only sorted by latest()
        match ($filters['sort'] ?? 'top_rated') {
            'top_rated'  => $query->orderByDesc('rating')->orderByDesc('total_reviews'),
            'price_low'  => $query->orderBy('price_per_minute'),
            'price_high' => $query->orderByDesc('price_per_minute'),
            'experience' => $query->orderByDesc('experience'),
            'newest'     => $query->latest(),
            default      => $query->orderByDesc('rating'),
        };

        return $query;
    }

    /* -- Admin listing ---------------------------------------- */
    public function adminList(array $filters = []): Builder
    {
        $query = Astrologer::query()
            ->with('user:id,name,email,profile_image,is_active') // N+1 FIX
            ->withTrashed();

        // Search: name + email + expertise
        if ($search = trim($filters['search'] ?? '')) {
            $like = "%{$search}%";
            $query->where(function (Builder $q) use ($like) {
                $q->where('expertise', 'like', $like)
                  ->orWhereHas('user', fn ($u) =>
                      $u->where('name',  'like', $like)
                        ->orWhere('email', 'like', $like)
                  );
            });
        }

        // is_verified filter
        if (array_key_exists('is_verified', $filters) && $filters['is_verified'] !== '') {
            $v = filter_var($filters['is_verified'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($v !== null) $query->where('is_verified', $v);
        }

        // is_online filter (admin panel ke liye)
        if (array_key_exists('is_online', $filters) && $filters['is_online'] !== '') {
            $o = filter_var($filters['is_online'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($o !== null) $query->where('is_online', $o);
        }

        return $query->latest();
    }

    /* -- Single public profile -------------------------------- */
    public function find(int $id): Astrologer
    {
        return Astrologer::with(['user:id,name,email,profile_image', 'schedules'])
            ->where('is_verified', true)
            ->whereNull('deleted_at')
            ->findOrFail($id);
    }
}
