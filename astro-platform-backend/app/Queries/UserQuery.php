<?php

namespace App\Queries;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class UserQuery
{
    public static function base(): Builder
    {
        return User::query()->select([
            'id',
            'name',
            'email',
            'profile_image',
            'deleted_at',
            'created_at',
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
        return $query->when($search, function ($q) use ($search) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        });
    }

    public static function latest(Builder $query): Builder
    {
        return $query->latest();
    }
}