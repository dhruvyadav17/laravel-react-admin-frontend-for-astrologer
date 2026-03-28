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
    AdminUserController,
    AstrologerController as AdminAstrologerController
};

use App\Http\Controllers\Api\{
    RoleController,
    PermissionController
};

/* ================= APP ================= */
use App\Http\Controllers\Api\App\AstrologerController;


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);
Route::post('/forgot-password', ForgotPasswordController::class);
Route::post('/reset-password', ResetPasswordController::class);
Route::post('/refresh-token', RefreshTokenController::class);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | FRONTEND (APP)
    |--------------------------------------------------------------------------
    */
    Route::prefix('app')->group(function () {

        /* ================= PROFILE ================= */
        Route::get('/profile', ProfileController::class);
        Route::post('/logout', LogoutController::class);

        /* ================= EMAIL ================= */
        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify']);
        Route::post('/email/resend', [EmailVerificationController::class, 'resend']);

        /* ================= ASTROLOGERS ================= */
        Route::get('/astrologers', [AstrologerController::class, 'index']);
        Route::get('/astrologers/{id}', [AstrologerController::class, 'show']);
    });


    /*
    |--------------------------------------------------------------------------
    | ADMIN PANEL
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->name('admin.')->group(function () {

        /* ================= DASHBOARD ================= */
        Route::get('/sidebar', SidebarController::class);
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        /* ================= CREATE ADMIN ================= */
        Route::post('/admins', [AdminUserController::class, 'store'])
            ->middleware('permission:role-manage');

        /* ================= USERS ================= */
        Route::prefix('users')->group(function () {

            Route::get('/', [UserController::class, 'index'])
                ->middleware('permission:user-view');

            Route::post('/', [UserController::class, 'store'])
                ->middleware('permission:user-create');

            Route::put('/{user}', [UserController::class, 'update'])
                ->middleware('permission:user-update');

            Route::delete('/{user}', [UserController::class, 'destroy'])
                ->middleware('permission:user-delete');

            Route::patch('/{id}/restore', [UserController::class, 'restore'])
                ->middleware('permission:user-restore');

            Route::post('/{user}/assign-role', [UserController::class, 'assignRole'])
                ->middleware('permission:user-assign-role');

            Route::post('/{user}/permissions', [UserController::class, 'assignPermissions'])
                ->middleware('permission:user-assign-permission');

            Route::get('/{user}/permissions', [UserController::class, 'permissions'])
                ->middleware('permission:user-view');
        });

        /* ================= ASTROLOGERS (🔥 NEW) ================= */
        Route::prefix('astrologers')->group(function () {

            Route::get('/', [AdminAstrologerController::class, 'index'])
                ->middleware('permission:user-view');

            Route::post('/', [AdminAstrologerController::class, 'store'])
                ->middleware('permission:user-create');

            Route::put('/{astrologer}', [AdminAstrologerController::class, 'update'])
                ->middleware('permission:user-update');

            Route::delete('/{astrologer}', [AdminAstrologerController::class, 'destroy'])
                ->middleware('permission:user-delete');
        });

        /* ================= ROLES ================= */
        Route::prefix('roles')
            ->middleware('permission:role-manage')
            ->group(function () {

                Route::get('/', [RoleController::class, 'index']);
                Route::post('/', [RoleController::class, 'store']);
                Route::put('/{role}', [RoleController::class, 'update']);
                Route::delete('/{role}', [RoleController::class, 'destroy']);

                Route::get('/{role}/permissions', [RoleController::class, 'permissions']);
                Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions']);
            });

        /* ================= PERMISSIONS ================= */
        Route::prefix('permissions')
            ->middleware('permission:permission-manage')
            ->group(function () {

                Route::get('/', [PermissionController::class, 'index']);
                Route::post('/', [PermissionController::class, 'store']);
                Route::get('/{permission}', [PermissionController::class, 'show']);
                Route::put('/{permission}', [PermissionController::class, 'update']);
                Route::delete('/{permission}', [PermissionController::class, 'destroy']);
            });
    });
});