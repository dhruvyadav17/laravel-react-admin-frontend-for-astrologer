<?php

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $existing = DB::table('newsletter_subscribers')
            ->where('email', $data['email'])->first();

        if ($existing) {
            if (!$existing->active) {
                DB::table('newsletter_subscribers')
                    ->where('email', $data['email'])
                    ->update(['active' => true, 'updated_at' => now()]);
                return $this->success('Welcome back! You are re-subscribed to our newsletter.');
            }
            return $this->success('You are already subscribed to our newsletter.');
        }

        DB::table('newsletter_subscribers')->insert([
            'email'      => $data['email'],
            'active'     => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->success('Successfully subscribed! You will receive daily astrology insights.');
    }
}
