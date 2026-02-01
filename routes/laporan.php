<?php

use Illuminate\Support\Facades\Route;

/**
 * Laporan (Reports) Routes
 * Stock, transaction, and expiry reports
 */

Route::middleware(['auth', 'verified'])->group(function () {
    // Laporan Stok (Stock Reports)
    Route::get('reports/stock', [\App\Http\Controllers\ReportController::class, 'stock'])->name('reports.stock');
    
    // Laporan Transaksi (Transaction Reports)
    Route::get('reports/transactions', [\App\Http\Controllers\ReportController::class, 'transactions'])->name('reports.transactions');
    
    // Laporan Kadaluarsa (Expiry Reports)
    Route::get('reports/expiry', [\App\Http\Controllers\ReportController::class, 'expiry'])->name('reports.expiry');
});
