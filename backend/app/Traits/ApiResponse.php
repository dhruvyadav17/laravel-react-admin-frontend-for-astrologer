<?php
// PATH: app/Traits/ApiResponse.php
// Standard API response methods used by all controllers

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Success response.
     *
     * @param string  $message
     * @param mixed   $data
     * @param array   $meta    e.g. ['pagination' => [...]]
     * @param int     $code
     */
    protected function success(
        string $message = 'Success',
        mixed  $data    = null,
        array  $meta    = [],
        int    $code    = 200
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data ?? [],
        ];

        // Merge meta keys at top level (pagination, unread_count, etc.)
        if (!empty($meta)) {
            $response = array_merge($response, $meta);
        }

        return response()->json($response, $code);
    }

    /**
     * Error response.
     *
     * @param string   $message
     * @param int      $code
     * @param array|null $errors  Field-level validation errors
     */
    protected function error(
        string $message = 'Error',
        int    $code    = 400,
        ?array $errors  = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
