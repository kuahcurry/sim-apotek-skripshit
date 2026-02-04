<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

/**
 * Main Web Routes
 * Organized routes are split into separate files for better maintainability
 */

// Welcome/Landing Page
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index'])->name('dashboard');
    
    // Permintaan Unit (Unit Requests)
    Route::post('permintaan/{id}/process', [\App\Http\Controllers\PermintaanUnitController::class, 'process'])->name('permintaan.process');
    Route::post('permintaan/{id}/complete', [\App\Http\Controllers\PermintaanUnitController::class, 'complete'])->name('permintaan.complete');
    Route::resource('permintaan', \App\Http\Controllers\PermintaanUnitController::class);
    
    // Stok Opname (Stock Taking)
    Route::post('stok-opname/{stokOpname}/start', [\App\Http\Controllers\StokOpnameController::class, 'startOpname'])->name('stok-opname.start');
    Route::post('stok-opname/{stokOpname}/complete', [\App\Http\Controllers\StokOpnameController::class, 'completeOpname'])->name('stok-opname.complete');
    Route::post('stok-opname/{stokOpname}/approve', [\App\Http\Controllers\StokOpnameController::class, 'approve'])->name('stok-opname.approve');
    Route::resource('stok-opname', \App\Http\Controllers\StokOpnameController::class);
    
    // Users Management
    Route::resource('users', \App\Http\Controllers\UserController::class);
});

// Organized Route Files
require __DIR__.'/obat.php';         // Medicine-related routes
require __DIR__.'/transaksi.php';    // Transaction routes
require __DIR__.'/masterdata.php';   // Master data routes
require __DIR__.'/laporan.php';      // Report routes
require __DIR__.'/settings.php';     // User settings routes
