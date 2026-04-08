<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class Pagination
{
    /**
     * Standard Meta (🔥 reusable)
     */
    public static function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
        ];
    }

    /**
     * Full Response (🔥 PRO LEVEL)
     * data + meta together
     */
    public static function response(LengthAwarePaginator $paginator, callable $transform = null): array
    {
        $data = $transform
            ? collect($paginator->items())->map($transform)
            : $paginator->items();

        return [
            'data' => $data,
            'meta' => self::meta($paginator),
        ];
    }

    /**
     * Optional: Links (future ready 🔥)
     */
    public static function links(LengthAwarePaginator $paginator): array
    {
        return [
            'first' => $paginator->url(1),
            'last'  => $paginator->url($paginator->lastPage()),
            'prev'  => $paginator->previousPageUrl(),
            'next'  => $paginator->nextPageUrl(),
        ];
    }
}