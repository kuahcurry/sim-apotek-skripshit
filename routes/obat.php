<?php

use Illuminate\Support\Facades\Route;

/**
 * Obat (Medicine) Routes
 * Handles medicine inventory, batches, prescriptions, destruction, and QR codes
 */

Route::middleware(['auth', 'verified'])->group(function () {
    // Data Obat (Main Medicine Inventory)
    Route::resource('obat', \App\Http\Controllers\ObatController::class);
    
    // Batch Obat
    Route::resource('batch', \App\Http\Controllers\BatchObatController::class);
    
    // Resep (Prescriptions)
    Route::resource('resep', \App\Http\Controllers\ResepController::class);
    
    // Pemusnahan (Medicine Destruction)
    Route::post('pemusnahan/{pemusnahan}/approve', [\App\Http\Controllers\PemusnahanObatController::class, 'approve'])->name('pemusnahan.approve');
    Route::resource('pemusnahan', \App\Http\Controllers\PemusnahanObatController::class);
    
    // QR Code
    Route::get('qr', [\App\Http\Controllers\QrCodeController::class, 'index'])->name('qr.index');
});
