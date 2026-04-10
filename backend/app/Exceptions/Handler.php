<?php
// PATH: app/Exceptions/Handler.php

namespace App\Exceptions;

use App\Traits\ApiResponse;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponse;

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson()) {

            // Validation errors
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors'  => $e->errors(),
                ], 422);
            }

            // HTTP errors (403, 404, etc.)
            if ($e instanceof HttpException) {
                return $this->error(
                    $e->getMessage() ?: 'Request error',
                    $e->getStatusCode()
                );
            }

            // Fallback
            return $this->error(
                config('app.debug') ? $e->getMessage() : 'Server error',
                500
            );
        }

        return parent::render($request, $e);
    }
}
