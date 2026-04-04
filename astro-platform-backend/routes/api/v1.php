<?php
// PATH: routes/api/v1.php  MAJOR UPDATE
// CHANGES: astrologer portal routes, reviews endpoint, fix permissions user-*→astrologer-*, restore+verify

use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AstrologerController as AdminAstrologerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\SidebarController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\App\AstrologerController;
use App\Http\Controllers\Api\Astrologer\ProfileController as AstrologerProfileController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Auth\RefreshTokenController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Password\ForgotPasswordController;
use App\Http\Controllers\Api\Password\ResetPasswordController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;



Route::prefix('v1')->group(function () {

    /* ── PUBLIC ────────────────────────────────────────────── */
    Route::post('/login',           LoginController::class);
    Route::post('/register',        RegisterController::class);
    Route::post('/forgot-password', ForgotPasswordController::class);
    Route::post('/reset-password',  ResetPasswordController::class);
    Route::post('/token/refresh',   RefreshTokenController::class);

    Route::get('/astrologers',              [AstrologerController::class, 'index']);
    Route::get('/astrologers/{id}',         [AstrologerController::class, 'show']);
    Route::get('/astrologers/{id}/reviews', [AstrologerController::class, 'reviews']); // NEW

    /* ── AUTHENTICATED ─────────────────────────────────────── */
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', LogoutController::class);
        Route::get('/me',      ProfileController::class);
        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify']);
        Route::post('/email/resend',            [EmailVerificationController::class, 'resend']);

        Route::post('/upload/image', [UploadController::class, 'image']);

        // Submit review – role:user only NEW
        Route::post('/astrologers/{id}/reviews', [AstrologerController::class, 'submitReview'])
            ->middleware('role:user');

        /* ── ASTROLOGER PORTAL (NEW) ─────────────────────────*/
        Route::prefix('astrologer')->middleware('role:astrologer')->name('astrologer.')->group(function () {
            Route::get('/me',                [AstrologerProfileController::class, 'me']);
            Route::patch('/me',              [AstrologerProfileController::class, 'update']);
            Route::patch('/me/availability', [AstrologerProfileController::class, 'toggleAvailability']);
            Route::get('/me/reviews',        [AstrologerProfileController::class, 'myReviews']);
            Route::get('/me/stats',          [AstrologerProfileController::class, 'stats']);
            Route::get('/me/schedule',       [AstrologerProfileController::class, 'schedule']);
            Route::post('/me/schedule',      [AstrologerProfileController::class, 'saveSchedule']);
        });

        /* ── ADMIN ───────────────────────────────────────────*/
        Route::prefix('admin')->name('admin.')->group(function () {

            Route::get('/sidebar',         SidebarController::class);
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
            Route::post('/admins',         [AdminUserController::class, 'store'])
                ->middleware('permission:role-manage');

            Route::prefix('users')->group(function () {
                Route::get('/',                    [UserController::class, 'index'])->middleware('permission:user-view');
                Route::post('/',                   [UserController::class, 'store'])->middleware('permission:user-create');
                Route::put('/{user}',              [UserController::class, 'update'])->middleware('permission:user-update');
                Route::delete('/{user}',           [UserController::class, 'destroy'])->middleware('permission:user-delete');
                Route::patch('/{id}/restore',      [UserController::class, 'restore'])->middleware('permission:user-restore');
                Route::post('/{user}/assign-role', [UserController::class, 'assignRole'])->middleware('permission:user-assign-role');
                Route::post('/{user}/permissions', [UserController::class, 'assignPermissions'])->middleware('permission:user-assign-permission');
                Route::get('/{user}/permissions',  [UserController::class, 'permissions'])->middleware('permission:user-view');
            });

            // FIXED: user-* → astrologer-* permissions; added restore+verify
            Route::prefix('astrologers')->group(function () {
                Route::get('/',                      [AdminAstrologerController::class, 'index'])->middleware('permission:astrologer-view');
                Route::post('/',                     [AdminAstrologerController::class, 'store'])->middleware('permission:astrologer-create');
                Route::put('/{astrologer}',          [AdminAstrologerController::class, 'update'])->middleware('permission:astrologer-update');
                Route::delete('/{astrologer}',       [AdminAstrologerController::class, 'destroy'])->middleware('permission:astrologer-delete');
                Route::patch('/{id}/restore',        [AdminAstrologerController::class, 'restore'])->middleware('permission:astrologer-restore'); // NEW
                Route::patch('/{astrologer}/verify', [AdminAstrologerController::class, 'verify'])->middleware('permission:astrologer-verify');   // NEW
            });

            Route::prefix('roles')->middleware('permission:role-manage')->group(function () {
                Route::get('/',                    [RoleController::class, 'index']);
                Route::post('/',                   [RoleController::class, 'store']);
                Route::put('/{role}',              [RoleController::class, 'update']);
                Route::delete('/{role}',           [RoleController::class, 'destroy']);
                Route::get('/{role}/permissions',  [RoleController::class, 'permissions']);
                Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions']);
            });

            Route::prefix('permissions')->middleware('permission:permission-manage')->group(function () {
                Route::get('/',               [PermissionController::class, 'index']);
                Route::post('/',              [PermissionController::class, 'store']);
                Route::get('/{permission}',   [PermissionController::class, 'show']);
                Route::put('/{permission}',   [PermissionController::class, 'update']);
                Route::delete('/{permission}',[PermissionController::class, 'destroy']);
            });
        });
    });
});