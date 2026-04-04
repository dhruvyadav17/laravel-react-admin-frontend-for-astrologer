<?php
// PATH: app/Http/Controllers/Api/Astrologer/ProfileController.php
// NEW FILE — Astrologer apna portal manage kare
// REASON: Pehle astrologer kuch bhi manage nahi kar sakta tha apne account mein

namespace App\Http\Controllers\Api\Astrologer;

use App\Http\Controllers\Controller;
use App\Http\Requests\AstrologerRequest;
use App\Http\Resources\AstroResource;
use App\Http\Resources\ReviewResource;
use App\Services\App\AstrologerService;
use App\Services\App\ReviewService;
use App\Services\App\ScheduleService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        protected AstrologerService $service,
        protected ReviewService     $reviewService,
        protected ScheduleService   $scheduleService,
    ) {}

    // GET /astrologer/me
    public function me(Request $request)
    {
        $astrologer = $request->user()
            ->astrologer()->with(['user','schedules'])->firstOrFail();
        return $this->success('Profile fetched', new AstroResource($astrologer));
    }

    // PATCH /astrologer/me
    public function update(AstrologerRequest $request)
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $updated    = $this->service->selfUpdate($astrologer, $request->validated());
        return $this->success('Profile updated', new AstroResource($updated));
    }

    // PATCH /astrologer/me/availability
    public function toggleAvailability(Request $request)
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $updated    = $this->service->toggleOnline($astrologer);
        return $this->success(
            $updated->is_online ? 'You are now online' : 'You are now offline',
            ['is_online' => $updated->is_online, 'is_available' => $updated->is_available]
        );
    }

    // GET /astrologer/me/reviews
    public function myReviews(Request $request)
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $reviews    = $this->reviewService->forAstrologer($astrologer->id);
        return $this->success('Reviews fetched', ReviewResource::collection($reviews));
    }

    // GET /astrologer/me/stats
    public function stats(Request $request)
    {
        $a = $request->user()->astrologer()->firstOrFail();
        return $this->success('Stats fetched', [
            'rating'              => $a->rating,
            'total_reviews'       => $a->total_reviews,
            'total_consultations' => $a->total_consultations,
            'is_online'           => $a->is_online,
            'is_available'        => $a->is_available,
        ]);
    }

    // GET /astrologer/me/schedule
    public function schedule(Request $request)
    {
        $astrologer = $request->user()->astrologer()->with('schedules')->firstOrFail();
        return $this->success('Schedule fetched', $astrologer->schedules);
    }

    // POST /astrologer/me/schedule
    public function saveSchedule(Request $request)
    {
        $request->validate([
            'schedules'               => 'required|array',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time'  => 'required|date_format:H:i',
            'schedules.*.end_time'    => 'required|date_format:H:i',
            'schedules.*.is_active'   => 'boolean',
        ]);

        $astrologer = $request->user()->astrologer()->firstOrFail();
        $schedule   = $this->scheduleService->sync($astrologer, $request->schedules);
        return $this->success('Schedule saved', $schedule);
    }
}