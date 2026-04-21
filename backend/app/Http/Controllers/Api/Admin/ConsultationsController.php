<?php
/**
 * Admin ConsultationsController — all consultations with filters + summary.
 * GET /admin/consultations
 */

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConsultationsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Consultation::with(['user:id,name,email', 'astrologer:id,user_id,expertise,price_per_minute',
            'astrologer.user:id,name'])
            ->latest();

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $paginated = $query->paginate(20);

        // Summary stats for the current filter
        $summaryQuery = Consultation::query();
        if ($request->filled('status')) $summaryQuery->where('status', $request->status);
        if ($request->filled('type'))   $summaryQuery->where('type', $request->type);
        if ($request->filled('from'))   $summaryQuery->whereDate('created_at', '>=', $request->from);
        if ($request->filled('to'))     $summaryQuery->whereDate('created_at', '<=', $request->to);

        $summary = [
            'total'     => $summaryQuery->count(),
            'completed' => (clone $summaryQuery)->where('status', 'completed')->count(),
            'pending'   => (clone $summaryQuery)->where('status', 'pending')->count(),
            'revenue'   => (float) (clone $summaryQuery)->where('status', 'completed')->sum('total_amount'),
        ];

        // Format resource
        $data = $paginated->getCollection()->map(function ($c) {
            return [
                'id'               => $c->id,
                'type'             => $c->type,
                'status'           => $c->status,
                'rate_per_minute'  => $c->rate_per_minute,
                'total_amount'     => $c->total_amount,
                'duration_minutes' => $c->duration_minutes,
                'created_at'       => $c->created_at->diffForHumans(),
                'user'             => $c->user ? [
                    'name'  => $c->user->name,
                    'email' => $c->user->email,
                ] : null,
                'astrologer'       => $c->astrologer ? [
                    'name'      => $c->astrologer->user?->name ?? '—',
                    'expertise' => $c->astrologer->expertise,
                ] : null,
            ];
        });

        return $this->success('Consultations report', $data, [
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'from'         => $paginated->firstItem(),
                'to'           => $paginated->lastItem(),
            ],
            'summary' => $summary,
        ]);
    }
}
