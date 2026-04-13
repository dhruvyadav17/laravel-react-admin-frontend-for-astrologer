<?php
//   Overlapping schedules like Monday 9-12 and 10-2 were both saved

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\AstrologerSchedule;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ScheduleService
{
    private const DAY_NAMES = [
        0 => 'Sunday', 1 => 'Monday', 2 => 'Tuesday',
        3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday',
    ];

    /* -- Get schedules for astrologer ---------------------- */
    public function forAstrologer(Astrologer $astrologer): Collection
    {
        return $astrologer->schedules()->orderBy('day_of_week')->orderBy('start_time')->get();
    }

    /* -- Sync -- validate overlaps first, then save -------- */
    public function sync(Astrologer $astrologer, array $schedules): Collection
    {
        // Validate overlaps before touching DB
        $this->validateNoOverlaps($schedules);

        // Only then delete + recreate
        $astrologer->schedules()->delete();

        return collect($schedules)->map(fn ($s) => AstrologerSchedule::create([
            'astrologer_id' => $astrologer->id,
            'day_of_week'   => $s['day_of_week'],
            'start_time'    => $s['start_time'],
            'end_time'      => $s['end_time'],
            'is_active'     => $s['is_active'] ?? true,
        ]));
    }

    /* -- Private: overlap detection ----------------------- */
    private function validateNoOverlaps(array $schedules): void
    {
        // Group by day
        $byDay = collect($schedules)
            ->where('is_active', true)  // inactive slots don't conflict
            ->groupBy('day_of_week');

        $errors = [];

        foreach ($byDay as $day => $slots) {
            // Convert to minutes for easy comparison
            $times = $slots->map(fn ($s) => [
                'start' => $this->toMinutes($s['start_time']),
                'end'   => $this->toMinutes($s['end_time']),
                'raw'   => $s,
            ])->sortBy('start')->values();

            for ($i = 0; $i < $times->count(); $i++) {
                for ($j = $i + 1; $j < $times->count(); $j++) {
                    $a = $times[$i];
                    $b = $times[$j];

                    // Overlap if: a.start < b.end AND b.start < a.end
                    if ($a['start'] < $b['end'] && $b['start'] < $a['end']) {
                        $dayName = self::DAY_NAMES[$day] ?? "Day {$day}";
                        $errors[] = "{$dayName}: {$a['raw']['start_time']}-{$a['raw']['end_time']} overlaps with {$b['raw']['start_time']}-{$b['raw']['end_time']}";
                    }
                }
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages([
                'schedules' => ['Schedule overlaps detected: ' . implode('; ', $errors)],
            ]);
        }
    }

    private function toMinutes(string $time): int
    {
        [$h, $m] = explode(':', $time);
        return ((int) $h * 60) + (int) $m;
    }
}
