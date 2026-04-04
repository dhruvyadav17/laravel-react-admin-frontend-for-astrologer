<?php
// PATH: app/Queries/AstrologerQuery.php
// NEW FILE — Inline filters service se query layer mein move kiye
// REASON: Reusability, testability. Public vs admin query cleanly separated.
// PUBLIC filters: online, expertise, language, min_price, max_price, min_rating, consultation_type, sort
// ADMIN filters: search, is_verified

namespace App\Queries;

use App\Models\Astrologer;
use Illuminate\Database\Eloquent\Builder;

class AstrologerQuery
{
    public static function publicBase(array $filters = []): Builder
    {
        $q = Astrologer::query()
            ->with(['user:id,name,profile_image,is_online,is_verified'])
            ->where('astrologers.is_verified', true);

        if (!empty($filters['online']))
            $q->where('is_online', true)->where('is_available', true);

        if (!empty($filters['expertise']))
            $q->where('expertise', 'like', '%'.$filters['expertise'].'%');

        if (!empty($filters['language']))
            $q->whereJsonContains('languages', $filters['language']);

        if (!empty($filters['min_price']))
            $q->where('price_per_minute', '>=', (float)$filters['min_price']);

        if (!empty($filters['max_price']))
            $q->where('price_per_minute', '<=', (float)$filters['max_price']);

        if (!empty($filters['min_rating']))
            $q->where('rating', '>=', (float)$filters['min_rating']);

        if (!empty($filters['consultation_type']) && $filters['consultation_type'] !== 'all') {
            $type = $filters['consultation_type'];
            $q->where(fn($sq) => $sq->where('consultation_type', $type)
                ->orWhere('consultation_type', 'all'));
        }

        match ($filters['sort'] ?? 'top_rated') {
            'price_low'  => $q->orderBy('price_per_minute'),
            'price_high' => $q->orderByDesc('price_per_minute'),
            'experience' => $q->orderByDesc('experience'),
            'newest'     => $q->orderByDesc('created_at'),
            default      => $q->orderByDesc('rating')->orderByDesc('total_reviews'),
        };

        return $q;
    }

    public static function adminBase(array $filters = []): Builder
    {
        $q = Astrologer::query()
            ->withTrashed()
            ->with(['user:id,name,email,profile_image,is_active,deleted_at'])
            ->latest('astrologers.created_at');

        if (!empty($filters['search'])) {
            $s = '%'.$filters['search'].'%';
            $q->whereHas('user', fn($sq) =>
                $sq->where('name','like',$s)->orWhere('email','like',$s)
            )->orWhere('expertise','like',$s);
        }

        if (isset($filters['is_verified']))
            $q->where('is_verified', (bool)$filters['is_verified']);

        return $q;
    }
}