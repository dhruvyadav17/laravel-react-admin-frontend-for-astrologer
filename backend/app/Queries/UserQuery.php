<?php
// PATH: app/Queries/UserQuery.php
// FIX BUG-14: base() mein sirf basic columns the — is_active, is_verified, is_online missing the
//              UserResource in fields use karta hai → null aata tha list response mein
//              Ab saare columns select kiye jo Resource needs karta hai

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
            'is_active',      // FIX: missing tha
            'is_verified',    // FIX: missing tha
            'is_online',      // FIX: missing tha
            'email_verified_at',
            'last_login_at',
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
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        });
    }

    public static function latest(Builder $query): Builder
    {
        return $query->latest();
    }
}
