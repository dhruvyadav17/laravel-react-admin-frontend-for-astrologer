<?php
// PATH: app/Support/Pagination.php
// FIX: Pagination::meta() method add kiya — AdminAstrologerController + ConsultationControllers
//      dono jagah call hota tha lekin method exist nahi tha → Fatal 500 error
// FIX: fromPaginator() alias add kiya backward compat ke liye

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
     * Alias for meta() — backward compat.
     */
    public static function fromPaginator(LengthAwarePaginator $paginator): array
    {
        return self::meta($paginator);
    }
}
