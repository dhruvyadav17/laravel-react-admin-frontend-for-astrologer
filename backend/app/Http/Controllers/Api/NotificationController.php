<?php
// PATH: app/Http/Controllers/Api/NotificationController.php
// GET  /api/v1/notifications         — list
// PATCH /api/v1/notifications/read   — mark all read
// PATCH /api/v1/notifications/{id}   — mark one read

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Pagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /* ── GET: List notifications ────────────────── */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(20);

        $unread = $request->user()->unreadNotifications()->count();

        return $this->success('Notifications fetched', [
            'notifications' => $notifications->map(fn ($n) => [
                'id'         => $n->id,
                'data'       => $n->data,
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at->diffForHumans(),
            ]),
            'unread_count' => $unread,
        ]);
    }

    /* ── PATCH: Mark all as read ────────────────── */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return $this->success('All notifications marked as read');
    }

    /* ── PATCH: Mark one as read ────────────────── */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $this->success('Notification marked as read');
    }
}
