<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        api:      __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies (needed for correct IP behind Nginx/load balancer)
        $middleware->trustProxies(at: '*');

        // NOTE: EnsureFrontendRequestsAreStateful is intentionally REMOVED.
        // This project uses Bearer token auth (Sanctum token mode), NOT cookie/session auth.
        // That middleware requires session + encryption which causes MissingAppKeyException
        // on fresh installs before php artisan key:generate is run.

        // Custom middleware aliases
        $middleware->alias([
            'role'       => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);

        // Audit logger on authenticated API requests
        $middleware->appendToGroup('api', \App\Http\Middleware\AuditLogger::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Custom exception rendering handled by app/Exceptions/Handler.php
    })->create();
