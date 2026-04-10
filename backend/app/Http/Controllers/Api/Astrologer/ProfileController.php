<?php
// PATH: app/Http/Controllers/Api/Astrologer/ProfileController.php
// IMPROVED: earnings() endpoint added

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

    /* ── GET /astrologer/me ─────────────────────── */
    public function me(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->with(['user', 'schedules'])->firstOrFail();
        return $this->success('Profile fetched', new AstrologerResource($astrologer));
    }

    /* ── PATCH /astrologer/me ───────────────────── */
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

    /* ── PATCH /astrologer/me/availability ─────── */
    public function toggleAvailability(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $updated    = $this->astrologerService->toggleAvailability($astrologer);

        return $this->success('Availability updated', [
            'is_online'    => $updated->is_online,
            'is_available' => $updated->is_available,
        ]);
    }

    /* ── GET /astrologer/me/reviews ─────────────── */
    public function myReviews(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $page       = (int) $request->query('page', 1);
        $paginator  = $this->reviewService->myReviews($astrologer, $page);

        return $this->success('Reviews fetched', $paginator, [
            'pagination' => Pagination::meta($paginator),
        ]);
    }

    /* ── GET /astrologer/me/stats ───────────────── */
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

    /* ── GET /astrologer/me/schedule ────────────── */
    public function schedule(Request $request): JsonResponse
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        return $this->success('Schedule fetched', $this->scheduleService->forAstrologer($astrologer));
    }

    /* ── POST /astrologer/me/schedule ──────────── */
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

    /* ── GET /astrologer/me/earnings ────────────── */
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
