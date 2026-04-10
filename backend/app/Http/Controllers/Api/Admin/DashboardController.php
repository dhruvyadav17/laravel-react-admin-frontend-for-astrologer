<?php
// PATH: app/Http/Controllers/Api/Admin/DashboardController.php
// IMPROVED: Revenue data real (from wallet_transactions + astrologer_earnings)
// IMPROVED: revenue_today, revenue_30d, revenue_chart (last 30 days daily)
// IMPROVED: type_breakdown (chat/call/video %)

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
        $data = Cache::remember('dashboard_stats', 60, function () {

            // Revenue (from wallet transactions — debit = user paid)
            $revenueTotal   = WalletTransaction::where('type', 'debit')->sum('amount');
            $revenueToday   = WalletTransaction::where('type', 'debit')
                ->whereDate('created_at', today())->sum('amount');
            $revenue30d     = WalletTransaction::where('type', 'debit')
                ->where('created_at', '>=', now()->subDays(30))->sum('amount');

            // Daily revenue chart — last 30 days
            $revenueChart = WalletTransaction::where('type', 'debit')
                ->where('created_at', '>=', now()->subDays(29))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(amount) as revenue')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn ($r) => [
                    'date'    => $r->date,
                    'revenue' => (float) $r->revenue,
                ]);

            // Consultation type breakdown
            $typeBreakdown = Consultation::where('status', 'completed')
                ->select('type', DB::raw('COUNT(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type');

            // Today's consultations
            $consultationsToday = Consultation::whereDate('created_at', today())->count();

            return [
                'total_users'         => User::whereNull('deleted_at')->count(),
                'total_astrologers'   => Astrologer::where('is_verified', true)->whereNull('deleted_at')->count(),
                'online_astrologers'  => Astrologer::where('is_online', true)->where('is_available', true)->whereNull('deleted_at')->count(),
                'total_consultations' => (int) Astrologer::whereNull('deleted_at')->sum('total_consultations'),

                // Revenue
                'revenue'             => (float) $revenueTotal,
                'revenue_today'       => (float) $revenueToday,
                'revenue_30d'         => (float) $revenue30d,
                'revenue_chart'       => $revenueChart,

                // Breakdowns
                'type_breakdown'      => $typeBreakdown,
                'consultations_today' => $consultationsToday,
            ];
        });

        return $this->success('Dashboard stats', $data);
    }
}
