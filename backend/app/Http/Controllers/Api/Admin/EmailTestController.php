<?php
/**
 * EmailTestController — test email configuration from admin panel.
 * POST /admin/email/test → sends test email to given address
 */

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class EmailTestController extends Controller
{
    public function test(Request $request): JsonResponse
    {
        $data = $request->validate([
            'to' => ['required', 'email'],
        ]);

        try {
            Mail::raw(
                "✅ Test email from AstroPortal\n\nIf you received this email, your SMTP configuration is working correctly!\n\nSent at: " . now()->toDateTimeString(),
                function ($message) use ($data) {
                    $message->to($data['to'])
                        ->subject('✅ AstroPortal — Email Test')
                        ->from(
                            config('mail.from.address', 'noreply@astro.in'),
                            config('mail.from.name', 'AstroPortal')
                        );
                }
            );

            return $this->success("Test email sent to {$data['to']}. Check your inbox!");

        } catch (\Exception $e) {
            return $this->error('Failed to send email: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /admin/email/config — return current mail config (safe fields only)
     */
    public function config(): JsonResponse
    {
        return $this->success('Mail config', [
            'mailer'       => config('mail.default'),
            'host'         => config('mail.mailers.smtp.host'),
            'port'         => config('mail.mailers.smtp.port'),
            'username'     => config('mail.mailers.smtp.username') ? '***configured***' : null,
            'from_address' => config('mail.from.address'),
            'from_name'    => config('mail.from.name'),
            'is_configured' => config('mail.default') !== 'log' && !empty(config('mail.mailers.smtp.username')),
        ]);
    }
}
