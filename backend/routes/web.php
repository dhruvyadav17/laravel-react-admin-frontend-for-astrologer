<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
// ADMIN REACT
Route::view('/admin/{any?}', 'admin')
    ->where('any', '.*');

// USER REACT
Route::view('/{any?}', 'user')
    ->where('any', '^(?!admin).*$');

Route::middleware(['auth:sanctum', 'role:admin'])
    ->get('/admin/dashboard', fn () => 'Admin Access');
