<?php

namespace App\Queries;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class UserQuery
{
    public static function base(): Builder
    {
        // FIX BE-D: 'is_verified' and 'is_online' are NOT on users table — they belong to astrologers
        // Removed to prevent "Unknown column" SQL error
        return User::query()->select([
            'id', 'name', 'email', 'profile_image',
            'is_active',
            'email_verified_at', 'last_login_at',
            'deleted_at', 'created_at',
        ]);
    }

    public static function withRoles(): Builder
    {
        return self::base()
            ->withTrashed()
            ->with(['roles:id,name']);
    }

    public static function search(Builder $query, ?string $search): Builder
    {
        return $query->when($search, fn ($q) =>
            $q->where(fn ($q) =>
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )
        );
    }

    public static function latest(Builder $query): Builder
    {
        return $query->latest();
    }
}
