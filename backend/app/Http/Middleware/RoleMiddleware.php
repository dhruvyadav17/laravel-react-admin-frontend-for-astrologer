<?php

namespace App\Http\Middleware;

use Closure;
use App\Traits\ApiResponse;

class RoleMiddleware
{
    use ApiResponse;

    public function handle($request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole($roles)) {
            return $this->error('Forbidden', null, 403);
        }

        return $next($request);
    }
}
