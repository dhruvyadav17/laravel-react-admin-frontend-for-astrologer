<?php

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

            /* ================= VALIDATION ERRORS ================= */
            if ($e instanceof ValidationException) {
                return $this->error(
                    'Validation failed',
                    $e->errors(),
                    422
                );
            }

            /* ================= HTTP EXCEPTIONS ================= */
            if ($e instanceof HttpException) {
                return $this->error(
                    $e->getMessage() ?: 'Request error',
                    null,
                    $e->getStatusCode()
                );
            }

            /* ================= FALLBACK ================= */
            return $this->error(
                config('app.debug')
                    ? $e->getMessage()
                    : 'Server error',
                null,
                500
            );
        }

        return parent::render($request, $e);
    }
}
