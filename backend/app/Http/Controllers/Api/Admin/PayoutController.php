<?php
/**
 * PayoutController — Admin manages astrologer payouts.
 *
 * GET  /admin/payouts         — list all pending/settled earnings
 * POST /admin/payouts/settle  — mark selected earnings as settled
 * GET  /admin/payouts/summary — per-astrologer payout summary
 */

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AstrologerEarning;
use App\Models\Astrologer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PayoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $paginator = AstrologerEarning::with([
            'astrologer.user:id,name,email',
            'consultation:id,type,started_at,duration_minutes',
        ])
        ->when($status !== 'all', fn($q) => $q->where('status', $status))
        ->latest()
        ->paginate(20);

        $data = $paginator->getCollection()->map(fn($e) => [
            'id'              => $e->id,
            'consultation_id' => $e->consultation_id,
            'gross_amount'    => $e->gross_amount,
            'platform_fee'    => $e->platform_fee,
            'net_amount'      => $e->net_amount,
            'status'          => $e->status,
            'settled_at'      => $e->settled_at?->diffForHumans(),
            'created_at'      => $e->created_at->diffForHumans(),
            'astrologer'      => [
                'id'    => $e->astrologer?->id,
                'name'  => $e->astrologer?->user?->name ?? '—',
                'email' => $e->astrologer?->user?->email ?? '—',
            ],
            'consultation' => [
                'type'             => $e->consultation?->type,
                'duration_minutes' => $e->consultation?->duration_minutes,
            ],
        ]);

        $pendingTotal  = AstrologerEarning::where('status', 'pending')->sum('net_amount');
        $settledTotal  = AstrologerEarning::where('status', 'settled')->sum('net_amount');

        return $this->success('Payouts', $data, [
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
            'summary' => [
                'pending_total' => (float) $pendingTotal,
                'settled_total' => (float) $settledTotal,
            ],
        ]);
    }

    public function settle(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'            => ['required', 'array', 'min:1'],
            'ids.*'          => ['integer', 'exists:astrologer_earnings,id'],
        ]);

        $count = AstrologerEarning::whereIn('id', $data['ids'])
            ->where('status', 'pending')
            ->update([
                'status'      => 'settled',
                'settled_at'  => now(),
                'updated_at'  => now(),
            ]);

        return $this->success("Marked {$count} earning(s) as settled.");
    }

    public function summary(): JsonResponse
    {
        $rows = Astrologer::with('user:id,name,email')
            ->withSum(['earnings as pending_amount' => fn($q) => $q->where('status','pending')], 'net_amount')
            ->withSum(['earnings as settled_amount' => fn($q) => $q->where('status','settled')], 'net_amount')
            ->withCount('earnings')
            ->whereHas('earnings')
            ->get()
            ->map(fn($a) => [
                'id'             => $a->id,
                'name'           => $a->user?->name ?? '—',
                'email'          => $a->user?->email ?? '—',
                'pending_amount' => (float) ($a->pending_amount ?? 0),
                'settled_amount' => (float) ($a->settled_amount ?? 0),
                'total_earnings' => $a->earnings_count,
            ])
            ->sortByDesc('pending_amount')
            ->values();

        return $this->success('Payout summary', $rows);
    }
}
