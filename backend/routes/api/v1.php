<?php
// PATH: routes/api/v1.php
// IMPROVED: Rate limiting added on sensitive endpoints
//   login: 5 attempts/min — brute force protection
//   register: 10/min — spam protection
//   wallet recharge: 10/min — abuse protection
//   consultation book: 5/min — spam protection
//   public listing: 60/min — normal browsing

use App\Features\Astrologer\Controllers\AdminAstrologerController;
use App\Features\Astrologer\Controllers\UserAstrologerController;
use App\Features\Auth\Controllers\EmailVerificationController;
use App\Features\Auth\Controllers\LoginController;
use App\Features\Auth\Controllers\LogoutController;
use App\Features\Auth\Controllers\ProfileController;
use App\Features\Auth\Controllers\RefreshTokenController;
use App\Features\Auth\Controllers\RegisterController;
use App\Features\Permission\Controllers\PermissionController;
use App\Features\Role\Controllers\RoleController;
use App\Features\User\Controllers\AdminUserController;
use App\Features\User\Controllers\UserController;
use App\Http\Controllers\Api\Admin\ActivityController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\SidebarController;
use App\Http\Controllers\Api\App\ConsultationController;
use App\Http\Controllers\Api\Astrologer\ConsultationController as AstrologerConsultationController;
use App\Http\Controllers\Api\Astrologer\ProfileController as AstrologerProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Password\ForgotPasswordController;
use App\Http\Controllers\Api\Password\ResetPasswordController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /* ── PUBLIC — with rate limits ──────────────────────────── */

    // Auth: strict rate limiting
    Route::post('/login',           LoginController::class)
        ->middleware('throttle:5,1');    // 5 attempts per minute

    Route::post('/register',        RegisterController::class)
        ->middleware('throttle:10,1');   // 10 per minute

    Route::post('/forgot-password', ForgotPasswordController::class)
        ->middleware('throttle:5,1');

    Route::post('/reset-password',  ResetPasswordController::class)
        ->middleware('throttle:5,1');

    Route::post('/token/refresh',   RefreshTokenController::class)
        ->middleware('throttle:30,1');

    // Public listings: generous limit
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/astrologers',              [UserAstrologerController::class, 'index']);
        Route::get('/astrologers/{id}',         [UserAstrologerController::class, 'show']);
        Route::get('/astrologers/{id}/reviews', [UserAstrologerController::class, 'reviews']);
    });

    /* ── AUTHENTICATED ──────────────────────────────────────── */
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', LogoutController::class);
        Route::get('/me',      ProfileController::class);
        Route::patch('/me',    \App\Features\Auth\Controllers\UpdateProfileController::class);

        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify']);
        Route::post('/email/resend',            [EmailVerificationController::class, 'resend'])
            ->middleware('throttle:3,1');

        Route::post('/upload/image', [UploadController::class, 'image'])
            ->middleware('throttle:20,1');

        // Favorites
        Route::get('/favorites',          [FavoriteController::class, 'index']);
        Route::post('/favorites/{id}',    [FavoriteController::class, 'toggle']);

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/',        [NotificationController::class, 'index']);
            Route::patch('/read',  [NotificationController::class, 'markAllRead']);
            Route::patch('/{id}',  [NotificationController::class, 'markRead']);
        });

        // Wallet — rate limited
        Route::prefix('wallet')->group(function () {
            Route::get('/',             [WalletController::class, 'show']);
            Route::post('/recharge',    [WalletController::class, 'recharge'])
                ->middleware('throttle:10,1');
            Route::get('/transactions', [WalletController::class, 'transactions']);
        });

        // Review submit — rate limited
        Route::post('/astrologers/{id}/reviews', [UserAstrologerController::class, 'submitReview'])
            ->middleware(['role:user', 'throttle:5,1']);

        /* ── USER: Consultations ────────────────────────────── */
        Route::prefix('consultations')->middleware('role:user')->group(function () {
            Route::get('/stats',                      [ConsultationController::class, 'stats']);
            Route::get('/',                         [ConsultationController::class, 'index']);
            Route::post('/',                        [ConsultationController::class, 'store'])
                ->middleware('throttle:5,1');  // prevent spam booking
            Route::get('/{consultation}',           [ConsultationController::class, 'show']);
            Route::delete('/{consultation}/cancel', [ConsultationController::class, 'cancel']);
            Route::get('/{consultation}/messages',  [ConsultationController::class, 'messages']);
            Route::post('/{consultation}/messages', [ConsultationController::class, 'sendMessage'])
                ->middleware('throttle:60,1');
            Route::get('/{consultation}/receipt',  [ConsultationController::class, 'receipt']);
            Route::get('/{consultation}/recordings',  [\App\Http\Controllers\Api\RecordingController::class, 'index']);
            Route::post('/{consultation}/recordings', [\App\Http\Controllers\Api\RecordingController::class, 'store']);
            Route::post('/{consultation}/signal',     [ConsultationController::class, 'sendSignal'])
                ->middleware('throttle:120,1');
            Route::get('/{consultation}/signals',     [ConsultationController::class, 'getSignals'])
                ->middleware('throttle:120,1');
            Route::patch('/{consultation}/call-status', [ConsultationController::class, 'updateCallStatus']);
        });

        /* ── ASTROLOGER PORTAL ──────────────────────────────── */
        Route::prefix('astrologer')->middleware('role:astrologer')->name('astrologer.')->group(function () {
            Route::get('/me',                [AstrologerProfileController::class, 'me']);
            Route::patch('/me',              [AstrologerProfileController::class, 'update']);
            Route::patch('/me/availability', [AstrologerProfileController::class, 'toggleAvailability']);
            Route::get('/me/reviews',        [AstrologerProfileController::class, 'myReviews']);
            Route::get('/me/stats',          [AstrologerProfileController::class, 'stats']);
            Route::get('/me/earnings',       [AstrologerProfileController::class, 'earnings']);
            Route::post('/me/heartbeat',     [AstrologerProfileController::class, 'heartbeat']);
            Route::get('/me/schedule',       [AstrologerProfileController::class, 'schedule']);
            Route::get('/consultations/{consultation}/recordings',  [\App\Http\Controllers\Api\RecordingController::class, 'index']);
            Route::post('/consultations/{consultation}/recordings', [\App\Http\Controllers\Api\RecordingController::class, 'store']);
            Route::post('/me/schedule',      [AstrologerProfileController::class, 'saveSchedule']);

            Route::prefix('consultations')->group(function () {
                Route::get('/',                             [AstrologerConsultationController::class, 'index']);
                Route::get('/{consultation}',               [AstrologerConsultationController::class, 'show']);
                Route::patch('/{consultation}/accept',      [AstrologerConsultationController::class, 'accept']);
                Route::patch('/{consultation}/reject',      [AstrologerConsultationController::class, 'reject']);
                Route::patch('/{consultation}/start',       [AstrologerConsultationController::class, 'start']);
                Route::patch('/{consultation}/end',         [AstrologerConsultationController::class, 'end']);
                Route::get('/{consultation}/messages',      [AstrologerConsultationController::class, 'messages']);
                Route::post('/{consultation}/messages',     [AstrologerConsultationController::class, 'sendMessage'])
                    ->middleware('throttle:60,1');
                // WebRTC signaling routes
                Route::post('/{consultation}/signal',       [AstrologerConsultationController::class, 'sendSignal'])
                    ->middleware('throttle:120,1');
                Route::get('/{consultation}/signals',       [AstrologerConsultationController::class, 'getSignals'])
                    ->middleware('throttle:120,1');
                Route::patch('/{consultation}/call-status', [AstrologerConsultationController::class, 'updateCallStatus']);
            });
        });

        /* ── ADMIN ──────────────────────────────────────────── */
        Route::prefix('admin')->name('admin.')->group(function () {

            Route::get('/sidebar',         SidebarController::class);
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('/activity',        [ActivityController::class, 'index']);

            Route::post('/admins', [AdminUserController::class, 'store'])
                ->middleware('permission:role-manage');

            // Users
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

            // Astrologers
            Route::prefix('astrologers')->group(function () {
                Route::get('/',                      [AdminAstrologerController::class, 'index'])->middleware('permission:astrologer-view');
                Route::post('/',                     [AdminAstrologerController::class, 'store'])->middleware('permission:astrologer-create');
                Route::put('/{astrologer}',          [AdminAstrologerController::class, 'update'])->middleware('permission:astrologer-update');
                Route::delete('/{astrologer}',       [AdminAstrologerController::class, 'destroy'])->middleware('permission:astrologer-delete');
                Route::patch('/{id}/restore',        [AdminAstrologerController::class, 'restore'])->middleware('permission:astrologer-restore');
                Route::patch('/{astrologer}/verify', [AdminAstrologerController::class, 'verify'])->middleware('permission:astrologer-verify');
            });

            // Roles
            Route::prefix('roles')->middleware('permission:role-manage')->group(function () {
                Route::get('/',                    [RoleController::class, 'index']);
                Route::post('/',                   [RoleController::class, 'store']);
                Route::put('/{role}',              [RoleController::class, 'update']);
                Route::delete('/{role}',           [RoleController::class, 'destroy']);
                Route::get('/{role}/permissions',  [RoleController::class, 'permissions']);
                Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions']);
            });

            // Permissions
            Route::prefix('permissions')->middleware('permission:permission-manage')->group(function () {
                Route::get('/',                [PermissionController::class, 'index']);
                Route::post('/',               [PermissionController::class, 'store']);
                Route::get('/{permission}',    [PermissionController::class, 'show']);
                Route::put('/{permission}',    [PermissionController::class, 'update']);
                Route::delete('/{permission}', [PermissionController::class, 'destroy']);
            });
        });
    });
});
