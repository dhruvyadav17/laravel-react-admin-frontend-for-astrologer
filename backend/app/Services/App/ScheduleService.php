<?php
// PATH: app/Services/App/ScheduleService.php
// NEW FILE — Astrologer weekly schedule sync

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\AstrologerSchedule;
use Illuminate\Support\Collection;

class ScheduleService
{
    // Replace strategy: delete all → recreate
    public function sync(Astrologer $astrologer, array $schedules): Collection
    {
        $astrologer->schedules()->delete();

        return collect($schedules)->map(fn($s) => AstrologerSchedule::create([
            'astrologer_id' => $astrologer->id,
            'day_of_week'   => $s['day_of_week'],
            'start_time'    => $s['start_time'],
            'end_time'      => $s['end_time'],
            'is_active'     => $s['is_active'] ?? true,
        ]));
    }
}