<?php

use App\Domains\Astrologer\Controllers\AdminAstrologerController;
use App\Domains\Astrologer\Controllers\UserAstrologerController;
use App\Domains\Auth\Controllers\EmailVerificationController;
use App\Domains\Auth\Controllers\LoginController;
use App\Domains\Auth\Controllers\LogoutController;
use App\Domains\Auth\Controllers\ProfileController;
use App\Domains\Auth\Controllers\RefreshTokenController;
use App\Domains\Auth\Controllers\RegisterController;
use App\Domains\Auth\Controllers\UpdateProfileController;
use App\Domains\Consultation\Controllers\UserConsultationController;
use App\Domains\Consultation\Controllers\AstrologerConsultationController;
use App\Domains\Permission\Controllers\PermissionController;
use App\Domains\Role\Controllers\RoleController;
use App\Domains\User\Controllers\AdminUserController;
use App\Domains\User\Controllers\UserController;
use App\Http\Controllers\Api\Admin\ActivityController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\SidebarController;
use App\Http\Controllers\Api\Shared\FavoriteController;
use App\Http\Controllers\Api\Shared\NotificationController;
use App\Http\Controllers\Api\Shared\RecordingController;
use App\Http\Controllers\Api\Shared\UploadController;
use App\Http\Controllers\Api\Shared\WalletController;
use App\Http\Controllers\Api\Password\ForgotPasswordController;
use App\Http\Controllers\Api\Password\ResetPasswordController;
use App\Domains\Astrologer\Controllers\AstrologerProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    /* ── PUBLIC ─────────────────────────────────────────────────────────── */
    Route::post('/login',           LoginController::class)->middleware('throttle:5,1');
    Route::post('/register',        RegisterController::class)->middleware('throttle:10,1');
    Route::post('/forgot-password', ForgotPasswordController::class)->middleware('throttle:5,1');
    Route::post('/reset-password',  ResetPasswordController::class)->middleware('throttle:5,1');
    Route::post('/token/refresh',   RefreshTokenController::class)->middleware('throttle:30,1');

    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/astrologers',              [UserAstrologerController::class, 'index']);
        Route::get('/astrologers/{id}',         [UserAstrologerController::class, 'show']);
        Route::get('/astrologers/{id}/reviews', [UserAstrologerController::class, 'reviews']);
    });

    /* ── PUBLIC SETTINGS (no auth) ─────────────────────────────────────── */
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/settings/{group}', [App\Http\Controllers\Api\Admin\SiteSettingsController::class, 'publicGroup']);
    });
    Route::post('/contact', [App\Http\Controllers\Api\Admin\SiteSettingsController::class, 'submitContact'])->middleware('throttle:5,1');
    Route::post('/newsletter/subscribe', [App\Http\Controllers\Api\Shared\NewsletterController::class, 'subscribe'])->middleware('throttle:5,1');

    /* ── AUTHENTICATED ──────────────────────────────────────────────────── */
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', LogoutController::class);
        Route::get('/me',      ProfileController::class);
        Route::patch('/me',    UpdateProfileController::class);

        Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify']);
        Route::post('/email/resend',            [EmailVerificationController::class, 'resend'])->middleware('throttle:3,1');

        Route::post('/upload/image', [UploadController::class, 'image'])->middleware('throttle:20,1');

        Route::get('/favorites',       [FavoriteController::class, 'index']);
        Route::post('/favorites/{id}', [FavoriteController::class, 'toggle']);

        Route::prefix('notifications')->group(function () {
            Route::get('/',       [NotificationController::class, 'index']);
            Route::patch('/read', [NotificationController::class, 'markAllRead']);
            Route::patch('/{id}', [NotificationController::class, 'markRead']);
        });

        /* ── Payments (Razorpay) ─────────────────────────────────── */
        Route::prefix('payment')->middleware('throttle:10,1')->group(function () {
            Route::post('/create-order', [App\Http\Controllers\Api\Shared\PaymentController::class, 'createOrder']);
            Route::post('/verify',       [App\Http\Controllers\Api\Shared\PaymentController::class, 'verify']);
        });

        Route::prefix('wallet')->group(function () {
            Route::get('/',             [WalletController::class, 'show']);
            Route::post('/recharge',    [WalletController::class, 'recharge'])->middleware('throttle:10,1');
            Route::get('/transactions', [WalletController::class, 'transactions']);
        });

        Route::post('/astrologers/{id}/reviews', [UserAstrologerController::class, 'submitReview'])
            ->middleware(['role:user', 'throttle:5,1']);

        /* ── USER: Consultations ─────────────────────────────────────── */
        Route::prefix('consultations')->middleware('role:user')->group(function () {
            Route::get('/stats',                     [UserConsultationController::class, 'stats']);
            Route::get('/',                          [UserConsultationController::class, 'index']);
            Route::post('/',                         [UserConsultationController::class, 'store'])->middleware('throttle:5,1');
            Route::get('/{consultation}',            [UserConsultationController::class, 'show']);
            Route::delete('/{consultation}/cancel',  [UserConsultationController::class, 'cancel']);
            Route::get('/{consultation}/messages',   [UserConsultationController::class, 'messages']);
            Route::post('/{consultation}/messages',  [UserConsultationController::class, 'sendMessage'])->middleware('throttle:60,1');
            Route::get('/{consultation}/receipt',    [UserConsultationController::class, 'receipt']);
            Route::get('/{consultation}/recordings', [RecordingController::class, 'index']);
            Route::post('/{consultation}/recordings',[RecordingController::class, 'store']);
            Route::post('/{consultation}/signal',    [UserConsultationController::class, 'sendSignal'])->middleware('throttle:120,1');
            Route::post('/{consultation}/typing',     [UserConsultationController::class, 'typing'])->middleware('throttle:30,1');
            Route::get('/{consultation}/typing',      [UserConsultationController::class, 'getTyping'])->middleware('throttle:30,1');
            Route::get('/{consultation}/signals',    [UserConsultationController::class, 'getSignals'])->middleware('throttle:120,1');
            Route::patch('/{consultation}/call-status', [UserConsultationController::class, 'updateCallStatus']);
        });

        /* ── ASTROLOGER PORTAL ──────────────────────────────────────── */
        Route::prefix('astrologer')->middleware('role:astrologer')->name('astrologer.')->group(function () {
            Route::get('/me',                [AstrologerProfileController::class, 'me']);
            Route::patch('/me',              [AstrologerProfileController::class, 'update']);
            Route::patch('/me/availability', [AstrologerProfileController::class, 'toggleAvailability']);
            Route::get('/me/reviews',        [AstrologerProfileController::class, 'myReviews']);
            Route::get('/me/stats',          [AstrologerProfileController::class, 'stats']);
            Route::get('/me/earnings',       [AstrologerProfileController::class, 'earnings']);
            Route::post('/me/heartbeat',     [AstrologerProfileController::class, 'heartbeat']);
            Route::get('/me/schedule',       [AstrologerProfileController::class, 'schedule']);
            Route::post('/me/schedule',      [AstrologerProfileController::class, 'saveSchedule']);

            Route::prefix('consultations')->group(function () {
                Route::get('/',                                  [AstrologerConsultationController::class, 'index']);
                Route::get('/{consultation}',                    [AstrologerConsultationController::class, 'show']);
                Route::patch('/{consultation}/accept',           [AstrologerConsultationController::class, 'accept']);
                Route::patch('/{consultation}/reject',           [AstrologerConsultationController::class, 'reject']);
                Route::patch('/{consultation}/start',            [AstrologerConsultationController::class, 'start']);
                Route::patch('/{consultation}/end',              [AstrologerConsultationController::class, 'end']);
                Route::get('/{consultation}/messages',           [AstrologerConsultationController::class, 'messages']);
                Route::post('/{consultation}/messages',          [AstrologerConsultationController::class, 'sendMessage'])->middleware('throttle:60,1');
                Route::post('/{consultation}/signal',            [AstrologerConsultationController::class, 'sendSignal'])->middleware('throttle:120,1');
                Route::post('/{consultation}/typing',             [AstrologerConsultationController::class, 'typing'])->middleware('throttle:30,1');
                Route::get('/{consultation}/typing',              [AstrologerConsultationController::class, 'getTyping'])->middleware('throttle:30,1');
                Route::get('/{consultation}/signals',            [AstrologerConsultationController::class, 'getSignals'])->middleware('throttle:120,1');
                Route::patch('/{consultation}/call-status',      [AstrologerConsultationController::class, 'updateCallStatus']);
                Route::get('/{consultation}/recordings',         [RecordingController::class, 'index']);
                Route::post('/{consultation}/recordings',        [RecordingController::class, 'store']);
            });
        });

        /* ── ADMIN ──────────────────────────────────────────────────── */
        Route::prefix('admin')->name('admin.')->middleware('role:admin|manager|super-admin')->group(function () {
            Route::get('/sidebar',         SidebarController::class);
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('/activity',        [ActivityController::class, 'index']);
            Route::post('/admins',         [AdminUserController::class, 'store'])->middleware('permission:role-manage');

            Route::prefix('users')->group(function () {
                Route::get('/',                    [UserController::class, 'index'])->middleware('permission:user-view');
                Route::post('/',                   [UserController::class, 'store'])->middleware('permission:user-create');
                Route::put('/{user}',              [UserController::class, 'update'])->middleware('permission:user-update');
                Route::delete('/{user}',           [UserController::class, 'destroy'])->middleware('permission:user-delete');
                Route::patch('/{id}/restore',      [UserController::class, 'restore'])->middleware('permission:user-restore');
                Route::post('/{user}/assign-role', [UserController::class, 'assignRole'])->middleware('permission:user-assign-role');
                Route::post('/{user}/permissions', [UserController::class, 'assignPermissions'])->middleware('permission:user-assign-permission');
                Route::get('/{user}/permissions',  [UserController::class, 'permissions'])->middleware('permission:user-view');
                Route::post('/{user}/wallet-credit', [UserController::class, 'walletCredit'])->middleware(['permission:user-update', 'throttle:10,1']);
            });

            Route::prefix('astrologers')->group(function () {
                Route::get('/',                      [AdminAstrologerController::class, 'index'])->middleware('permission:astrologer-view');
                Route::post('/',                     [AdminAstrologerController::class, 'store'])->middleware('permission:astrologer-create');
                Route::put('/{astrologer}',          [AdminAstrologerController::class, 'update'])->middleware('permission:astrologer-update');
                Route::delete('/{astrologer}',       [AdminAstrologerController::class, 'destroy'])->middleware('permission:astrologer-delete');
                Route::patch('/{id}/restore',        [AdminAstrologerController::class, 'restore'])->middleware('permission:astrologer-restore');
                Route::patch('/{astrologer}/verify', [AdminAstrologerController::class, 'verify'])->middleware('permission:astrologer-verify');
            });

            Route::prefix('roles')->middleware('permission:role-manage')->group(function () {
                Route::get('/',                    [RoleController::class, 'index']);
                Route::post('/',                   [RoleController::class, 'store']);
                Route::put('/{role}',              [RoleController::class, 'update']);
                Route::delete('/{role}',           [RoleController::class, 'destroy']);
                Route::get('/{role}/permissions',  [RoleController::class, 'permissions']);
                Route::post('/{role}/permissions', [RoleController::class, 'assignPermissions']);
            });

            /* ── Reviews ────────────────────────────────────── */
            Route::prefix('reviews')->group(function () {
                Route::get('/',               [App\Http\Controllers\Api\Admin\ReviewController::class, 'index']);
                Route::post('/{id}/approve',  [App\Http\Controllers\Api\Admin\ReviewController::class, 'approve'])->middleware('throttle:20,1');
                Route::post('/{id}/reject',   [App\Http\Controllers\Api\Admin\ReviewController::class, 'reject'])->middleware('throttle:20,1');
            });

            /* ── Payouts ────────────────────────────────────── */
            Route::prefix('payouts')->group(function () {
                Route::get('/',         [App\Http\Controllers\Api\Admin\PayoutController::class, 'index']);
                Route::get('/summary',  [App\Http\Controllers\Api\Admin\PayoutController::class, 'summary']);
                Route::post('/settle',  [App\Http\Controllers\Api\Admin\PayoutController::class, 'settle'])->middleware('throttle:10,1');
            });

            /* ── Broadcast ─────────────────────────────────── */
            Route::post('/broadcast', [App\Http\Controllers\Api\Admin\BroadcastController::class, 'send'])
                ->middleware(['permission:dashboard-view', 'throttle:5,1']);

            /* ── Email Config ─────────────────────────────── */
            Route::prefix('email')->group(function () {
                Route::get('/config', [App\Http\Controllers\Api\Admin\EmailTestController::class, 'config']);
                Route::post('/test',  [App\Http\Controllers\Api\Admin\EmailTestController::class, 'test'])->middleware('throttle:3,1');
            });

            /* ── Newsletter ─────────────────────────────── */
            Route::get('/newsletter', [App\Http\Controllers\Api\Admin\NewsletterController::class, 'index'])
                ->middleware('permission:dashboard-view');

            /* ── Consultations Report ──────────────────── */
            Route::get('/consultations', [App\Http\Controllers\Api\Admin\ConsultationsController::class, 'index'])
                ->middleware('permission:dashboard-view');

            /* ── Site Settings ─────────────────────────── */
            Route::prefix('settings')->group(function () {
                Route::get('/{group}',  [App\Http\Controllers\Api\Admin\SiteSettingsController::class, 'getGroup']);
                Route::put('/{group}',  [App\Http\Controllers\Api\Admin\SiteSettingsController::class, 'updateGroup']);
            });

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
