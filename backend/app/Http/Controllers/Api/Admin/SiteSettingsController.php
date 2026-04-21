<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingsController extends Controller
{
    /**
     * GET /admin/settings/{group}
     * Returns all settings for a group.
     */
    public function getGroup(string $group): JsonResponse
    {
        $allowed = ['general', 'contact', 'about', 'faq', 'horoscope', 'privacy', 'terms'];
        if (!in_array($group, $allowed)) {
            return $this->error('Invalid settings group', 422);
        }

        $settings = SiteSetting::where('group', $group)->get()
            ->mapWithKeys(function ($item) {
                $value = match($item->type) {
                    'json'    => json_decode($item->value, true),
                    'boolean' => (bool) $item->value,
                    default   => $item->value,
                };
                return [$item->key => $value];
            });

        return $this->success("Settings fetched", $settings);
    }

    /**
     * GET /api/settings/{group}  (public)
     * Same but no auth needed — used by frontend pages.
     */
    public function publicGroup(string $group): JsonResponse
    {
        $allowed = ['contact', 'about', 'faq', 'horoscope', 'privacy', 'terms'];
        if (!in_array($group, $allowed)) {
            return $this->error('Invalid settings group', 422);
        }

        $settings = SiteSetting::where('group', $group)->get()
            ->mapWithKeys(function ($item) {
                $value = match($item->type) {
                    'json'    => json_decode($item->value, true),
                    'boolean' => (bool) $item->value,
                    default   => $item->value,
                };
                return [$item->key => $value];
            });

        return $this->success("Settings fetched", $settings);
    }

    /**
     * PUT /admin/settings/{group}
     * Admin updates settings for a group.
     */
    public function updateGroup(Request $request, string $group): JsonResponse
    {
        $allowed = ['general', 'contact', 'about', 'faq', 'horoscope', 'privacy', 'terms'];
        if (!in_array($group, $allowed)) {
            return $this->error('Invalid settings group', 422);
        }

        $data = $request->all();

        foreach ($data as $key => $value) {
            $setting = SiteSetting::where('key', $key)->where('group', $group)->first();
            if (!$setting) continue;

            $stored = match($setting->type) {
                'json'    => is_string($value) ? $value : json_encode($value),
                'boolean' => $value ? '1' : '0',
                default   => (string) $value,
            };

            $setting->update(['value' => $stored]);
        }

        return $this->success('Settings updated successfully');
    }

    /**
     * POST /api/contact (public)
     * Handles contact form submissions.
     */
    public function submitContact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:20|max:2000',
        ]);

        // Log the contact submission (in production, send email via Mail::to())
        \Illuminate\Support\Facades\Log::info('Contact form submission', [
            'name'    => $data['name'],
            'email'   => $data['email'],
            'subject' => $data['subject'],
            'message' => substr($data['message'], 0, 200),
        ]);

        // In production: Mail::to(config('mail.support_address', 'support@astro.in'))->send(new ContactMail($data));

        return $this->success('Message sent successfully! We will respond within 24 hours.');
    }
}
