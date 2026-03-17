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
        int $status = Response::HTTP_OK
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data ?? (object) [],
            'meta'    => (object) $meta,
        ], $status);
    }

    protected function error(
        string $message = 'Something went wrong',
        mixed $data = null,
        int $status = Response::HTTP_BAD_REQUEST
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => $data ?? (object) [],
        ], $status);
    }
}
