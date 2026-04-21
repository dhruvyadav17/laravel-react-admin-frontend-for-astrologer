<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class NewsletterController extends Controller
{
    public function index(): JsonResponse
    {
        $subscribers = DB::table('newsletter_subscribers')
            ->orderByDesc('created_at')
            ->paginate(20);

        $data = collect($subscribers->items())->map(fn($s) => [
            'id'         => $s->id,
            'email'      => $s->email,
            'active'     => (bool) $s->active,
            'created_at' => \Carbon\Carbon::parse($s->created_at)->diffForHumans(),
        ]);

        return $this->success('Subscribers', $data, [
            'pagination' => [
                'current_page' => $subscribers->currentPage(),
                'last_page'    => $subscribers->lastPage(),
                'per_page'     => $subscribers->perPage(),
                'total'        => $subscribers->total(),
                'from'         => $subscribers->firstItem(),
                'to'           => $subscribers->lastItem(),
            ],
        ]);
    }
}
