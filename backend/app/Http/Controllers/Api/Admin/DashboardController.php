<?php
/**
 * Admin DashboardController -- platform-level analytics.
 *
 * ENDPOINT: GET /admin/dashboard/stats
 *
 * Returns:
 *   total_users, total_astrologers, online_now (is_online = true),
 *   today_revenue, monthly_revenue, all_time_revenue, consultations_today,
 *   revenue_chart (last 30 days, day-by-day), consultation_types breakdown.
 *
 * TO ADD A NEW METRIC:
 * 1. Add the DB query in stats() method.
 * 2. Return it in the response array.
 * 3. Add a <StatCard> or chart in the frontend DashboardPage.tsx.
 *
 * PERFORMANCE NOTE
 * -----------------
 * For large datasets, cache the stats response for 5 minutes using
 * Cache::remember('admin:stats', 300, fn() => [...]).
 */

//   Also invalidated via WalletTransaction observer (see AppServiceProvider)

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Astrologer;
use App\Models\Consultation;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        // 30s cache, also invalidated by WalletTransaction observer
        $data = Cache::remember('dashboard_stats', 30, function () {

            $revenueTotal = (float) WalletTransaction::where('type', 'debit')->sum('amount');
            $revenueToday = (float) WalletTransaction::where('type', 'debit')
                ->whereDate('created_at', today())->sum('amount');
            $revenue30d   = (float) WalletTransaction::where('type', 'debit')
                ->where('created_at', '>=', now()->subDays(30))->sum('amount');

            // Daily revenue chart (last 30 days)
            $revenueChart = WalletTransaction::where('type', 'debit')
                ->where('created_at', '>=', now()->subDays(29))
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as revenue'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn ($r) => ['date' => $r->date, 'revenue' => (float) $r->revenue]);

            // Consultation type breakdown
            $typeBreakdown = Consultation::where('status', 'completed')
                ->select('type', DB::raw('COUNT(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type');

            return [
                'total_users'         => User::whereNull('deleted_at')->count(),
                'total_astrologers'   => Astrologer::where('is_verified', true)->whereNull('deleted_at')->count(),
                'online_astrologers'  => Astrologer::where('is_online', true)->where('is_available', true)->whereNull('deleted_at')->count(),
                'total_consultations' => (int) Astrologer::whereNull('deleted_at')->sum('total_consultations'),
                'revenue'             => $revenueTotal,
                'revenue_today'       => $revenueToday,
                'revenue_30d'         => $revenue30d,
                'revenue_chart'       => $revenueChart,
                'type_breakdown'      => $typeBreakdown,
                'consultations_today' => Consultation::whereDate('created_at', today())->count(),
            ];
        });

        return $this->success('Dashboard stats', $data);
    }
}
