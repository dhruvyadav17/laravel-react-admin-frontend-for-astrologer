<?php
// PATH: app/Services/App/ScheduleService.php
// Astrologer weekly schedule sync + fetch

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\AstrologerSchedule;
use Illuminate\Support\Collection;

class ScheduleService
{
    /* ── Get schedules for astrologer ───────────── */
    public function forAstrologer(Astrologer $astrologer): Collection
    {
        return $astrologer->schedules()
            ->orderBy('day_of_week')
            ->get();
    }

    /* ── Replace all schedules ──────────────────── */
    public function sync(Astrologer $astrologer, array $schedules): Collection
    {
        // Delete all → recreate (replace strategy)
        $astrologer->schedules()->delete();

        return collect($schedules)->map(fn ($s) => AstrologerSchedule::create([
            'astrologer_id' => $astrologer->id,
            'day_of_week'   => $s['day_of_week'],
            'start_time'    => $s['start_time'],
            'end_time'      => $s['end_time'],
            'is_active'     => $s['is_active'] ?? true,
        ]));
    }
}
