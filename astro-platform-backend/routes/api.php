<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API VERSIONING ENTRY
|--------------------------------------------------------------------------
*/
//require __DIR__.'/api/v1.php';

Route::prefix('v1')->group(
    base_path('routes/api/v1.php')
);