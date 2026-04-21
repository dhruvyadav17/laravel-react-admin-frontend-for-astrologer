<?php

namespace App\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Force the default cache store to 'database' at runtime.
        //
        // WHY: Laravel caches config in bootstrap/cache/config.php when
        // `php artisan config:cache` is run. If the cache was built with
        // CACHE_STORE=redis (from a Docker .env), it will try to connect to
        // 'redis' hostname even after changing .env — because .env is ignored
        // when a config cache exists.
        //
        // This runtime override bypasses the config cache entirely and ensures
        // XAMPP/local always uses the database cache store (no Redis needed).
        //
        // Production (Docker) uses CACHE_STORE=redis via .env.aws — that is fine
        // because Docker has a Redis container and no config:cache is used at build time.

        if ($this->isLocalEnv()) {
            config(['cache.default' => 'database']);
        }
    }

    public function boot(): void
    {
        // Clear dashboard stats cache whenever a wallet transaction is created
        \App\Models\WalletTransaction::created(function () {
            Cache::forget('dashboard_stats');
        });

        // Super-admin bypasses all permission/role Gate checks
        Gate::before(function ($user) {
            return $user->isSuperAdmin() ? true : null;
        });
    }

    private function isLocalEnv(): bool
    {
        // Only override on local/development — not in Docker/production
        // where Redis is actually available
        $env = $this->app->environment();
        return in_array($env, ['local', 'development', 'testing']);
    }
}
