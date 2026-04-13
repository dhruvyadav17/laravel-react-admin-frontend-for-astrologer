<?php
/**
 * AstrologerProfileController -- astrologer self-management endpoints.
 *
 * All routes require auth:sanctum + role:astrologer middleware.
 *
 * ENDPOINTS
 * ----------
 * GET    /astrologer/me              -- own profile (with user, reviews count)
 * PATCH  /astrologer/me              -- update profile fields
 * PATCH  /astrologer/me/availability -- toggle is_online / is_available
 * POST   /astrologer/me/heartbeat    -- keep-alive ping (every 30 s)
 * GET    /astrologer/me/stats        -- rating, reviews, consultation count
 * GET    /astrologer/me/earnings     -- earnings summary + recent records
 * GET    /astrologer/me/reviews      -- approved client reviews
 * GET    /astrologer/me/schedule     -- weekly schedule
 * POST   /astrologer/me/schedule     -- save weekly schedule (replaces existing)
 *
 * TO ADD A NEW FIELD TO THE PROFILE:
 * 1. Add it to the validation in update().
 * 2. Add the column to the astrologers migration.
 * 3. Add it to $fillable in the Astrologer model.
 */

namespace App\Http\Controllers\Api\Astrologer;

use App\Features\Astrologer\Resources\AstrologerResource;
use App\Features\Astrologer\Services\AstrologerService;
use App\Http\Controllers\Controller;
use App\Models\AstrologerEarning;
use App\Services\App\ReviewService;
use App\Services\App\ScheduleService;
use App\Services\App\WalletService;
use App\Support\Pagination;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AstrologerService $astrologerService,
        protected ReviewService     $reviewService,
        protected ScheduleService   $scheduleService,
        protected WalletService     $walletService,
    ) {}

    /* -- GET /astrologer/me ----------------------- */
    public function me(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->with(['user', 'schedules'])->firstOrFail();
        return $this->success('Profile fetched', new AstrologerResource($astrologer));
    }

    /* -- PATCH /astrologer/me --------------------- */
    public function update(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();

        $data = $request->validate([
            'bio'               => ['sometimes', 'string', 'max:2000'],
            'expertise'         => ['sometimes', 'string', 'max:255'],
            'languages'         => ['sometimes', 'array'],
            'languages.*'       => ['string', 'max:50'],
            'skills'            => ['sometimes', 'array'],
            'skills.*'          => ['string', 'max:100'],
            'consultation_type' => ['sometimes', 'in:chat,call,video,all'],
            'price_per_minute'  => ['sometimes', 'numeric', 'min:0', 'max:9999'],
            'profile_image'     => ['sometimes', 'nullable', 'string'],
            'gallery'           => ['sometimes', 'array', 'max:10'],
            'gallery.*'         => ['string'],
        ]);

        $updated = $this->astrologerService->selfUpdate($astrologer, $data);
        return $this->success('Profile updated', new AstrologerResource($updated->load('user')));
    }

    /* -- PATCH /astrologer/me/availability ------- */
    public function toggleAvailability(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $updated    = $this->astrologerService->toggleAvailability($astrologer);

        return $this->success('Availability updated', [
            'is_online'    => $updated->is_online,
            'is_available' => $updated->is_available,
        ]);
    }

    /* -- GET /astrologer/me/reviews --------------- */
    public function myReviews(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $page       = (int) $request->query('page', 1);
        $paginator  = $this->reviewService->myReviews($astrologer, $page);

        return $this->success('Reviews fetched', $paginator, [
            'pagination' => Pagination::meta($paginator),
        ]);
    }

    /* -- GET /astrologer/me/stats ----------------- */
    public function stats(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();

        return $this->success('Stats fetched', [
            'rating'              => $astrologer->rating,
            'total_reviews'       => $astrologer->total_reviews,
            'total_consultations' => $astrologer->total_consultations,
            'avg_response_time'   => $astrologer->avg_response_time,
            'is_online'           => $astrologer->is_online,
            'is_available'        => $astrologer->is_available,
        ]);
    }

    /* -- GET /astrologer/me/schedule -------------- */
    public function schedule(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        return $this->success('Schedule fetched', $this->scheduleService->forAstrologer($astrologer));
    }

    /* -- POST /astrologer/me/schedule ------------ */
    public function saveSchedule(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();

        $data = $request->validate([
            'schedules'               => ['required', 'array'],
            'schedules.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'schedules.*.start_time'  => ['required', 'date_format:H:i'],
            'schedules.*.end_time'    => ['required', 'date_format:H:i', 'after:schedules.*.start_time'],
            'schedules.*.is_active'   => ['boolean'],
        ]);

        $saved = $this->scheduleService->sync($astrologer, $data['schedules']);
        return $this->success('Schedule saved', $saved);
    }


    /* -- POST /astrologer/me/heartbeat ---------------- */
    // Called every 30s from frontend -- marks astrologer as still online
    // Artisan command 'astrologer:mark-offline' clears stale ones
    public function heartbeat(\Illuminate\Http\Request $request): \Illuminate\Http\JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();

        if ($astrologer->is_online) {
            // Touch last_heartbeat_at -- reset 5-min timeout
            $astrologer->update(['last_heartbeat_at' => now()]);
        }

        return $this->success('Heartbeat received', [
            'is_online'    => $astrologer->is_online,
            'is_available' => $astrologer->is_available,
        ]);
    }

    /* -- GET /astrologer/me/earnings -------------- */
    public function earnings(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $summary    = $this->walletService->astrologerSummary($astrologer->id);

        $data = AstrologerEarning::where('astrologer_id', $astrologer->id)
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($e) => [
                'id'              => $e->id,
                'consultation_id' => $e->consultation_id,
                'gross_amount'    => $e->gross_amount,
                'platform_fee'    => $e->platform_fee,
                'net_amount'      => $e->net_amount,
                'status'          => $e->status,
                'created_at'      => $e->created_at->diffForHumans(),
            ]);

        return $this->success('Earnings fetched', [
            'summary' => $summary,
            'data'    => $data,
        ]);
    }
}
