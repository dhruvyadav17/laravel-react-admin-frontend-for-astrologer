<?php
// PATH: app/Http/Controllers/Api/Admin/DashboardController.php
// FIX BUG-12: Backend stats return: total_astrologers, total_consultations, revenue 0 tha
//              Frontend DashboardStats type ab sahi hai — backend bhi matching data return kare
// IMPROVEMENT: Cache::tags() SQLite mein kaam nahi karta — Cache::remember() use kiya
//              (SQLite default driver — tags only file/redis driver mein kaam karte hain)

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Astrologer;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats()
    {
        // FIX: Cache::tags() SQLite pe crash karta hai
        // Use Cache::remember() without tags — works on all drivers
        $data = Cache::remember('dashboard_stats', 60, function () {

            $totalUsers = User::query()
                ->whereNull('deleted_at')
                ->count();

            $totalAstrologers = Astrologer::query()
                ->where('is_verified', true)
                ->whereNull('deleted_at')
                ->count();

            // Future: consultation model se count karana
            // Ab ke liye: total_consultations column ka sum
            $totalConsultations = Astrologer::query()
                ->whereNull('deleted_at')
                ->sum('total_consultations');

            return [
                'total_users'         => $totalUsers,
                'total_astrologers'   => $totalAstrologers,   // FIX: was missing
                'total_consultations' => (int) $totalConsultations, // FIX: was hardcoded 0
                'revenue'             => 0,   // Future: billing system se aayega
            ];
        });

        return $this->success('Dashboard stats', $data);
    }
}
