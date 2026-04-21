<?php
/**
 * BroadcastController — send notifications to groups of users.
 * POST /admin/broadcast → send to all users, all astrologers, or specific role
 */

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BroadcastController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target'  => ['required', 'in:all,users,astrologers'],
            'title'   => ['required', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:500'],
            'icon'    => ['sometimes', 'string', 'max:50'],
            'color'   => ['sometimes', 'string', 'in:primary,success,warning,danger,info'],
        ]);

        // Get target users
        $query = User::whereNull('deleted_at')->where('is_active', true);

        match($data['target']) {
            'users'       => $query->whereHas('roles', fn($q) => $q->where('name', 'user')),
            'astrologers' => $query->whereHas('roles', fn($q) => $q->where('name', 'astrologer')),
            default       => null, // all
        };

        $users = $query->get();
        $count = 0;

        foreach ($users as $user) {
            DB::table('notifications')->insert([
                'id'              => \Illuminate\Support\Str::uuid(),
                'type'            => 'App\Notifications\BroadcastNotification',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id'   => $user->id,
                'data'            => json_encode([
                    'type'    => 'broadcast',
                    'title'   => $data['title'],
                    'message' => $data['message'],
                    'icon'    => $data['icon']  ?? 'fa-bullhorn',
                    'color'   => $data['color'] ?? 'primary',
                    'url'     => null,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $count++;
        }

        return $this->success("Notification sent to {$count} {$data['target']}");
    }
}
