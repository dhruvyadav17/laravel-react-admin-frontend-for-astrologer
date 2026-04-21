<?php

namespace App\Http\Middleware;

use Closure;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class RoleMiddleware
{
    use ApiResponse;

    /**
     * Accepts Spatie-style pipe-separated roles: role:admin|manager|super-admin
     * Each pipe-separated value is treated as an OR condition.
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (! $user) {
            return $this->error('Unauthenticated.', 401);
        }

        // Flatten pipe-separated values: 'admin|manager' → ['admin', 'manager']
        $allowed = collect($roles)
            ->flatMap(fn (string $role) => explode('|', $role))
            ->filter()
            ->values()
            ->all();

        if (! $user->hasAnyRole($allowed)) {
            return $this->error('Forbidden. Insufficient role.', 403);
        }

        return $next($request);
    }
}
