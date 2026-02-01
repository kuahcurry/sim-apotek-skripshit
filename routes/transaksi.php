<?php

use Illuminate\Support\Facades\Route;

/**
 * Transaksi (Transaction) Routes
 * Handles all transactions including incoming and outgoing goods
 */

Route::middleware(['auth', 'verified'])->group(function () {
    // Semua Transaksi (All Transactions)
    Route::get('transaksi', [\App\Http\Controllers\TransaksiController::class, 'index'])->name('transaksi.index');
    
    // Barang Masuk (Incoming Goods)
    Route::get('transaksi/masuk', [\App\Http\Controllers\TransaksiController::class, 'masuk'])->name('transaksi.masuk');
    
    // Barang Keluar (Outgoing Goods)
    Route::get('transaksi/keluar', [\App\Http\Controllers\TransaksiController::class, 'keluar'])->name('transaksi.keluar');
    
    // Transaksi Resource Routes (create, store, show, edit, update, destroy)
    Route::resource('transaksi', \App\Http\Controllers\TransaksiController::class)->except(['index']);
});
