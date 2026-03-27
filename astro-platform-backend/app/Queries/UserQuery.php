<?php

namespace App\Queries;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class UserQuery
{
    /* ================= BASE ================= */

    public static function base(): Builder
    {
        return User::query()->select(self::columns());
    }

    /* ================= COLUMNS ================= */

    public static function columns(): array
    {
        return [
            'id',
            'name',
            'email',
            'experience',
            'price_per_minute',
            'bio',
            'deleted_at',
            'created_at',
        ];
    }

    /* ================= LIGHT LIST ================= */

    public static function list(): Builder
    {
        return self::base();
    }

    /* ================= WITH ROLES ================= */

    public static function withRoles(): Builder
    {
        return self::base()
            ->withTrashed()
            ->with([
                'roles:id,name'
            ]);
    }

    /* ================= ASTROLOGERS ================= */

    public static function astrologers(): Builder
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
            ->role('astrologer'); // 🔥 optimized
    }

    /* ================= SEARCH ================= */

    public static function search(Builder $query, ?string $search): Builder
    {
        return $query->when($search, function ($q) use ($search) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        });
    }

    /* ================= SORT ================= */

    public static function latest(Builder $query): Builder
    {
        return $query->latest();
    }
}