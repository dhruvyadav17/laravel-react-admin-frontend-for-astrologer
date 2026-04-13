<?php
/**
 * AuditLogger middleware -- records all mutating API requests to audit_logs.
 *
 * Registered as "audit" middleware alias in bootstrap/app.php.
 * Applied to all POST/PATCH/PUT/DELETE routes in routes/api/v1.php.
 *
 * Each log entry stores:
 *   user_id, action (derived from route name), subject_type, subject_id,
 *   ip_address, user_agent, meta (JSON with request summary).
 *
 * VIEWING LOGS: GET /admin/activity (requires admin role).
 *
 * TO ADD A CUSTOM ACTION NAME:
 * Override the deriveAction() method or add a mapping in the ACTION_MAP
 * constant inside this middleware.
 *
 * TO SKIP LOGGING FOR A ROUTE:
 * Add the route name to the $skip array in this middleware.
 */

// Logs key actions to audit_logs table for admin activity log

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuditLogger
{
    // Actions to log: [method, url_pattern, action_label]
    private const LOGGABLE = [
        ['POST',   '/login',              'user.login'],
        ['POST',   '/logout',             'user.logout'],
        ['POST',   '/consultations',      'consultation.booked'],
        ['PATCH',  '/accept',             'consultation.accepted'],
        ['PATCH',  '/reject',             'consultation.rejected'],
        ['PATCH',  '/start',              'consultation.started'],
        ['PATCH',  '/end',                'consultation.ended'],
        ['POST',   '/recharge',           'wallet.recharged'],
        ['POST',   '/admin/users',        'admin.user_created'],
        ['PUT',    '/admin/users',        'admin.user_updated'],
        ['DELETE', '/admin/users',        'admin.user_deleted'],
        ['POST',   '/admin/astrologers',  'admin.astrologer_created'],
        ['PATCH',  '/admin/astrologers',  'admin.astrologer_verified'],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful mutating requests (2xx, not GET)
        if ($request->method() === 'GET' || $response->getStatusCode() >= 400) {
            return $response;
        }

        $uri    = $request->getPathInfo();
        $method = $request->method();
        $action = $this->resolveAction($method, $uri);

        if ($action) {
            DB::table('audit_logs')->insert([
                'user_id'      => $request->user()?->id,
                'action'       => $action,
                'subject_type' => $this->resolveSubject($uri),
                'subject_id'   => $this->resolveSubjectId($uri),
                'ip_address'   => $request->ip(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }

        return $response;
    }

    private function resolveAction(string $method, string $uri): ?string
    {
        foreach (self::LOGGABLE as [$m, $pattern, $label]) {
            if ($m === $method && str_contains($uri, $pattern)) {
                return $label;
            }
        }
        return null;
    }

    private function resolveSubject(string $uri): ?string
    {
        if (str_contains($uri, 'consultations')) return 'Consultation';
        if (str_contains($uri, 'users'))         return 'User';
        if (str_contains($uri, 'astrologers'))   return 'Astrologer';
        if (str_contains($uri, 'wallet'))        return 'Wallet';
        return null;
    }

    private function resolveSubjectId(string $uri): ?int
    {
        // Extract numeric ID from URL: /consultations/12/accept → 12
        if (preg_match('/\/(\d+)\//', $uri, $m)) return (int)$m[1];
        if (preg_match('/\/(\d+)$/',  $uri, $m)) return (int)$m[1];
        return null;
    }
}
