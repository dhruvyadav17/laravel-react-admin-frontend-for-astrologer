<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Configuration\Exceptions;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // 🌐 API middleware group (Bearer Token based)
        $middleware->group('api', [
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // 🔐 Route middleware aliases (Kernel replacement)
        $middleware->alias([
            'auth'       => \Illuminate\Auth\Middleware\Authenticate::class,
            'role'       => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);
        // ✅ ADD THIS
        // Audit all API mutations
        $middleware->appendToGroup('api', \App\Http\Middleware\AuditLogger::class);

        $middleware->append(
            \Illuminate\Http\Middleware\HandleCors::class
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
