<?php

use Illuminate\Support\Facades\Route;

/* ================= AUTH ================= */
use App\Http\Controllers\Api\Auth\{
    RegisterController,
    LoginController,
    ProfileController,
    LogoutController,
    EmailVerificationController,
    RefreshTokenController
};

use App\Http\Controllers\Api\Password\{
    ForgotPasswordController,
    ResetPasswordController
};

/* ================= ADMIN ================= */
use App\Http\Controllers\Api\Admin\{
    UserController,
    SidebarController,
    DashboardController,
    AdminUserController
};

use App\Http\Controllers\Api\{
    RoleController,
    PermissionController
};

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/register', RegisterController::class)
    ->name('auth.register');

Route::post('/login', LoginController::class)
    ->name('auth.login');

Route::post('/forgot-password', ForgotPasswordController::class)
    ->name('auth.password.forgot');

Route::post('/reset-password', ResetPasswordController::class)
    ->name('auth.password.reset');

Route::post('/refresh-token', RefreshTokenController::class)
    ->name('auth.token.refresh');

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    /* ================= AUTH ================= */
    Route::get('/profile', ProfileController::class)
        ->name('auth.profile');

    Route::post('/logout', LogoutController::class)
        ->name('auth.logout');

    /* ================= EMAIL VERIFICATION ================= */
    Route::get(
        '/email/verify/{id}/{hash}',
        [EmailVerificationController::class, 'verify']
    )->name('auth.email.verify');

    Route::post(
        '/email/resend',
        [EmailVerificationController::class, 'resend']
    )->name('auth.email.resend');

    /*
    |--------------------------------------------------------------------------
    | ADMIN ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->name('admin.')->group(function () {

        /* ================= DASHBOARD ================= */
        Route::get('/sidebar', SidebarController::class)
            ->name('sidebar');

        Route::get('/dashboard/stats', [DashboardController::class, 'stats'])
            ->name('dashboard.stats');

        /* ================= CREATE ADMIN ================= */
        Route::post('/admins', [AdminUserController::class, 'store'])
            ->middleware('permission:role-manage')
            ->name('admins.store');

        /* ================= USERS ================= */
        Route::prefix('users')->name('users.')->group(function () {

            Route::get('/', [UserController::class, 'index'])
                ->middleware('permission:user-view')
                ->name('index');

            Route::post('/', [UserController::class, 'store'])
                ->middleware('permission:user-create')
                ->name('store');

            Route::put('/{user}', [UserController::class, 'update'])
                ->middleware('permission:user-update')
                ->name('update');

            Route::delete('/{user}', [UserController::class, 'destroy'])
                ->middleware('permission:user-delete')
                ->name('destroy');

            Route::post('/{user}/restore', [UserController::class, 'restore'])
                ->middleware('permission:user-delete')
                ->withTrashed()
                ->name('restore');

            Route::post('/{user}/assign-role', [UserController::class, 'assignRole'])
                ->middleware('permission:user-assign-role')
                ->name('assign-role');

            Route::post('/{user}/permissions', [UserController::class, 'assignPermissions'])
                ->middleware('permission:user-assign-permission')
                ->name('permissions.assign');

            Route::get('/{user}/permissions', [UserController::class, 'permissions'])
                ->middleware('permission:user-view')
                ->name('permissions.list');
        });

        /* ================= ROLES ================= */
        Route::prefix('roles')
            ->middleware('permission:role-manage')
            ->name('roles.')
            ->group(function () {

                Route::get('/', [RoleController::class, 'index'])
                    ->name('index');

                Route::post('/', [RoleController::class, 'store'])
                    ->name('store');

                Route::put('/{role}', [RoleController::class, 'update'])
                    ->name('update');

                Route::delete('/{role}', [RoleController::class, 'destroy'])
                    ->name('destroy');

                Route::get('/{role}/permissions', [RoleController::class, 'permissions'])
                    ->name('permissions.list');

                Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions'])
                    ->name('permissions.assign');
            });

        /* ================= PERMISSIONS ================= */
        Route::prefix('permissions')
            ->middleware('permission:permission-manage')
            ->name('permissions.')
            ->group(function () {

                Route::get('/', [PermissionController::class, 'index'])
                    ->name('index');

                Route::post('/', [PermissionController::class, 'store'])
                    ->name('store');

                Route::get('/{permission}', [PermissionController::class, 'show'])
                    ->name('show');

                Route::put('/{permission}', [PermissionController::class, 'update'])
                    ->name('update');

                Route::delete('/{permission}', [PermissionController::class, 'destroy'])
                    ->name('destroy');
            });
    });
});
