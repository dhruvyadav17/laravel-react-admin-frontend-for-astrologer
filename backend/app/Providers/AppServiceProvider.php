<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Cache invalidation: jab bhi wallet transaction ho, dashboard cache clear ho
        \App\Models\WalletTransaction::created(function () {
            \Illuminate\Support\Facades\Cache::forget('dashboard_stats');
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        /* 🔥 SUPER ADMIN = GOD MODE */
        Gate::before(function ($user) {
            return $user->isSuperAdmin() ? true : null;
        });
    }
}
