<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index'])->name('dashboard');
    
    // Obat (Medicines)
    Route::resource('obat', \App\Http\Controllers\ObatController::class);
    
    // Batch Obat
    Route::resource('batch', \App\Http\Controllers\BatchObatController::class);
    
    // Transaksi
    Route::get('transaksi', [\App\Http\Controllers\TransaksiController::class, 'index'])->name('transaksi.index');
    Route::get('transaksi/masuk', [\App\Http\Controllers\TransaksiController::class, 'masuk'])->name('transaksi.masuk');
    Route::get('transaksi/keluar', [\App\Http\Controllers\TransaksiController::class, 'keluar'])->name('transaksi.keluar');
    Route::resource('transaksi', \App\Http\Controllers\TransaksiController::class)->except(['index']);
    
    // Permintaan Unit
    Route::resource('permintaan', \App\Http\Controllers\PermintaanUnitController::class);
    
    // Resep
    Route::resource('resep', \App\Http\Controllers\ResepController::class);
    
    // Stok Opname
    Route::resource('stok-opname', \App\Http\Controllers\StokOpnameController::class);
    
    // Pemusnahan
    Route::resource('pemusnahan', \App\Http\Controllers\PemusnahanObatController::class);
    
    // QR Code
    Route::get('qr', [\App\Http\Controllers\QrCodeController::class, 'index'])->name('qr.index');
    
    // Master Data
    Route::resource('kategori-obat', \App\Http\Controllers\KategoriObatController::class);
    Route::resource('jenis-obat', \App\Http\Controllers\JenisObatController::class);
    Route::resource('satuan-obat', \App\Http\Controllers\SatuanObatController::class);
    Route::resource('unit-rumah-sakit', \App\Http\Controllers\UnitRumahSakitController::class);
    Route::resource('supplier', \App\Http\Controllers\SupplierController::class);
    
    // Reports
    Route::get('reports/stock', [\App\Http\Controllers\ReportController::class, 'stock'])->name('reports.stock');
    Route::get('reports/transactions', [\App\Http\Controllers\ReportController::class, 'transactions'])->name('reports.transactions');
    Route::get('reports/expiry', [\App\Http\Controllers\ReportController::class, 'expiry'])->name('reports.expiry');
    
    // Users
    Route::resource('users', \App\Http\Controllers\UserController::class);
});

require __DIR__.'/settings.php';
