<?php
// PATH: app/Http/Controllers/Api/Admin/DashboardController.php
// FEATURE: online_astrologers count add kiya
// FIX: Cache::tags() crash → Cache::remember()

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Astrologer;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats()
    {
        $data = Cache::remember('dashboard_stats', 60, function () {
            return [
                'total_users' => User::query()
                    ->whereNull('deleted_at')->count(),

                'total_astrologers' => Astrologer::query()
                    ->where('is_verified', true)
                    ->whereNull('deleted_at')->count(),

                'online_astrologers' => Astrologer::query()
                    ->where('is_online', true)
                    ->where('is_available', true)
                    ->whereNull('deleted_at')->count(),

                'total_consultations' => (int) Astrologer::query()
                    ->whereNull('deleted_at')
                    ->sum('total_consultations'),

                'revenue' => 0,
            ];
        });

        return $this->success('Dashboard stats', $data);
    }
}
