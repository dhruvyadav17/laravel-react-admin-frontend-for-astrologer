<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Spatie\Permission\PermissionRegistrar;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Clear Spatie permission cache on boot.
        // Wrapped in try/catch so composer dump-autoload doesn't fail
        // when the database isn't available (e.g. fresh install, CI).
        try {
            app(PermissionRegistrar::class)->forgetCachedPermissions();
        } catch (\Throwable) {
            // DB not ready — cache will be cleared on first real request
        }
    }
}
