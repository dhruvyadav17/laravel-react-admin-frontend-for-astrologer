<?php
//      called in multiple places but method did not exist → Fatal 500 error

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class Pagination
{
    /**
     * Standard pagination meta array.
     * Called by: AdminAstrologerController, ConsultationControllers
     */
    public static function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
            'from'         => $paginator->firstItem(),
            'to'           => $paginator->lastItem(),
        ];
    }

    /**
     * Full response with data + meta.
     * Called by: UserService::paginate()
     */
    public static function response(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => $paginator->items(),
            'meta' => ['pagination' => self::meta($paginator)],
        ];
    }

    /**
     * Alias for meta() -- backward compat.
     */
    public static function fromPaginator(LengthAwarePaginator $paginator): array
    {
        return self::meta($paginator);
    }
}
