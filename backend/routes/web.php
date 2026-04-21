<?php

use Illuminate\Support\Facades\Route;

// This is a pure API backend. Web routes just return a health check.
// The React frontend is served separately (Vite dev server or built files).
Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'AstroPortal API is running.',
        'version' => '1.0.0',
    ]);
});

Route::get('/up', function () {
    return response()->json(['status' => 'ok']);
});
