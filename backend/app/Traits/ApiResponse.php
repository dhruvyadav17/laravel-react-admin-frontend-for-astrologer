<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

trait ApiResponse
{
    protected function success(
        string $message = 'Action successful',
        mixed $data = null,
        array $meta = [],
        int $code = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data ?? [],
            'meta'    => $meta ?? [],
        ], $code);
    }

    protected function error(
        string $message = '!Error',
        $errors = null,
        int $code = 400
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => $errors ??  [],
        ], $code);
    }
}
