<?php
// PATH: app/Http/Controllers/Api/Admin/ActivityController.php
// GET /api/v1/admin/activity — paginated audit logs with filters

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Pagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('audit_logs as al')
            ->leftJoin('users as u', 'u.id', '=', 'al.user_id')
            ->select([
                'al.id',
                'al.action',
                'al.subject_type',
                'al.subject_id',
                'al.ip_address',
                'al.created_at',
                'u.name as user_name',
                'u.email as user_email',
            ])
            ->orderByDesc('al.created_at');

        // Filter by action
        if ($request->filled('action')) {
            $query->where('al.action', $request->action);
        }

        // Search by user name/email or IP
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('u.name',       'like', "%{$s}%")
                  ->orWhere('u.email',    'like', "%{$s}%")
                  ->orWhere('al.ip_address', 'like', "%{$s}%");
            });
        }

        $paginator = $query->paginate(20);

        // Format for frontend
        $data = collect($paginator->items())->map(fn ($row) => [
            'id'           => $row->id,
            'action'       => $row->action,
            'subject_type' => $row->subject_type,
            'subject_id'   => $row->subject_id,
            'ip_address'   => $row->ip_address,
            'created_at'   => \Carbon\Carbon::parse($row->created_at)->diffForHumans(),
            'user'         => $row->user_name
                ? ['name' => $row->user_name, 'email' => $row->user_email]
                : null,
        ]);

        return $this->success('Activity logs fetched', $data, [
            'pagination' => Pagination::meta($paginator),
        ]);
    }
}
