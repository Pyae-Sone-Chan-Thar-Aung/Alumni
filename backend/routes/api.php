<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\JobOpportunityController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{id}', [NewsController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // News routes
    Route::post('/news', [NewsController::class, 'store'])->middleware('admin');
    Route::put('/news/{id}', [NewsController::class, 'update'])->middleware('admin');
    Route::delete('/news/{id}', [NewsController::class, 'destroy'])->middleware('admin');
    
    // Job opportunities routes
    Route::get('/job-opportunities', [JobOpportunityController::class, 'index']);
    Route::get('/job-opportunities/{id}', [JobOpportunityController::class, 'show']);
    Route::post('/job-opportunities', [JobOpportunityController::class, 'store']);
    Route::put('/job-opportunities/{id}', [JobOpportunityController::class, 'update']);
    Route::delete('/job-opportunities/{id}', [JobOpportunityController::class, 'destroy']);
    
    // Batch routes
    Route::get('/batch-groups', [BatchController::class, 'index']);
    Route::get('/batch-groups/{id}', [BatchController::class, 'show']);
    Route::get('/batch-groups/{id}/messages', [BatchController::class, 'messages']);
    Route::post('/batch-groups/{id}/messages', [BatchController::class, 'storeMessage']);
    
    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::put('/admin/users/{id}/approve', [AdminController::class, 'approveUser']);
        Route::put('/admin/users/{id}/reject', [AdminController::class, 'rejectUser']);
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/statistics', [AdminController::class, 'statistics']);
    });
}); 