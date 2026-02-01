<?php

use Illuminate\Support\Facades\Route;

/**
 * Master Data Routes
 * Unified master data page with individual CRUD endpoints
 */

Route::middleware(['auth', 'verified'])->group(function () {
    // Master Data - Unified Page (displays all master data in tabs)
    Route::get('masterdata', [\App\Http\Controllers\KategoriObatController::class, 'index'])->name('masterdata.index');
    
    // Kategori Obat (Medicine Categories)
    Route::resource('kategori-obat', \App\Http\Controllers\KategoriObatController::class);
    
    // Jenis Obat (Medicine Types)
    Route::resource('jenis-obat', \App\Http\Controllers\JenisObatController::class);
    
    // Satuan Obat (Medicine Units)
    Route::resource('satuan-obat', \App\Http\Controllers\SatuanObatController::class);
    
    // Supplier
    Route::resource('supplier', \App\Http\Controllers\SupplierController::class);
    
    // Unit Rumah Sakit (kept for backend compatibility)
    Route::resource('unit-rumah-sakit', \App\Http\Controllers\UnitRumahSakitController::class);
});
