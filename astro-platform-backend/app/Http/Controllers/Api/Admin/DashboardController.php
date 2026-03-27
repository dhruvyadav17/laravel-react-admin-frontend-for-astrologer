<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats()
    {
        // 🔥 USER BASED CACHE (FIXED)
        $cacheKey = 'dashboard_' . auth()->id();

        $data = Cache::remember($cacheKey, 60, function () {
            return [
                'total_users' => User::query()->count(),

                'total_astrologers' => User::query()
                    ->role('astrologer')
                    ->select('id')
                    ->count(),

                'total_consultations' => 0,
                'revenue' => 0,
            ];
        });

        return $this->success('Dashboard stats', $data);
    }
}