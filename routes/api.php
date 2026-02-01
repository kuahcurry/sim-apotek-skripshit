<?php

use App\Http\Controllers\Api\BatchObatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JenisObatController;
use App\Http\Controllers\Api\KategoriObatController;
use App\Http\Controllers\Api\LogAktivitasController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\ObatController;
use App\Http\Controllers\Api\PemusnahanObatController;
use App\Http\Controllers\Api\PermintaanUnitController;
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ResepController;
use App\Http\Controllers\Api\SatuanObatController;
use App\Http\Controllers\Api\StokOpnameController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\UnitRumahSakitController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

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

Route::middleware(['auth:sanctum'])->group(function () {
    // Dashboard & Analytics
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/stock-levels', [DashboardController::class, 'stockLevels']);
        Route::get('/transaction-trends', [DashboardController::class, 'transactionTrends']);
        Route::get('/expiring-soon', [DashboardController::class, 'expiringSoon']);
        Route::get('/low-stock', [DashboardController::class, 'lowStock']);
        Route::get('/top-medicines', [DashboardController::class, 'topMedicines']);
        Route::get('/unit-requests', [DashboardController::class, 'unitRequests']);
        Route::get('/recent-transactions', [DashboardController::class, 'recentTransactions']);
    });

    // Master Data - Kategori Obat
    Route::apiResource('kategori-obat', KategoriObatController::class)->names([
        'index' => 'api.kategori-obat.index',
        'store' => 'api.kategori-obat.store',
        'show' => 'api.kategori-obat.show',
        'update' => 'api.kategori-obat.update',
        'destroy' => 'api.kategori-obat.destroy',
    ]);

    // Master Data - Jenis Obat
    Route::apiResource('jenis-obat', JenisObatController::class)->names([
        'index' => 'api.jenis-obat.index',
        'store' => 'api.jenis-obat.store',
        'show' => 'api.jenis-obat.show',
        'update' => 'api.jenis-obat.update',
        'destroy' => 'api.jenis-obat.destroy',
    ]);

    // Master Data - Satuan Obat
    Route::apiResource('satuan-obat', SatuanObatController::class)->names([
        'index' => 'api.satuan-obat.index',
        'store' => 'api.satuan-obat.store',
        'show' => 'api.satuan-obat.show',
        'update' => 'api.satuan-obat.update',
        'destroy' => 'api.satuan-obat.destroy',
    ]);

    // Master Data - Unit Rumah Sakit
    Route::apiResource('unit-rumah-sakit', UnitRumahSakitController::class)->names([
        'index' => 'api.unit-rumah-sakit.index',
        'store' => 'api.unit-rumah-sakit.store',
        'show' => 'api.unit-rumah-sakit.show',
        'update' => 'api.unit-rumah-sakit.update',
        'destroy' => 'api.unit-rumah-sakit.destroy',
    ]);

    // Obat (Medicine)
    Route::prefix('obat')->group(function () {
        Route::get('/low-stock', [ObatController::class, 'lowStock'])->name('api.obat.low-stock');
        Route::get('/search', [ObatController::class, 'search'])->name('api.obat.search');
        Route::get('/{obat}/batches', [ObatController::class, 'batches'])->name('api.obat.batches');
        Route::post('/{obat}/recalculate-stock', [ObatController::class, 'recalculateStock'])->name('api.obat.recalculate-stock');
    });
    Route::apiResource('obat', ObatController::class)->names([
        'index' => 'api.obat.index',
        'store' => 'api.obat.store',
        'show' => 'api.obat.show',
        'update' => 'api.obat.update',
        'destroy' => 'api.obat.destroy',
    ]);

    // Batch Obat
    Route::prefix('batch')->group(function () {
        Route::get('/expiring-soon', [BatchObatController::class, 'expiringSoon'])->name('api.batch.expiring-soon');
        Route::get('/expired', [BatchObatController::class, 'expired'])->name('api.batch.expired');
        Route::post('/{batch}/update-status', [BatchObatController::class, 'updateStatus'])->name('api.batch.update-status');
    });
    Route::apiResource('batch', BatchObatController::class)->names([
        'index' => 'api.batch.index',
        'store' => 'api.batch.store',
        'show' => 'api.batch.show',
        'update' => 'api.batch.update',
        'destroy' => 'api.batch.destroy',
    ]);

    // Transaksi
    Route::prefix('transaksi')->group(function () {
        Route::get('/today', [TransaksiController::class, 'today'])->name('api.transaksi.today');
        Route::get('/by-type/{type}', [TransaksiController::class, 'byType'])->name('api.transaksi.by-type');
        Route::post('/masuk', [TransaksiController::class, 'storeMasuk'])->name('api.transaksi.masuk');
        Route::post('/keluar', [TransaksiController::class, 'storeKeluar'])->name('api.transaksi.keluar');
        Route::post('/penjualan', [TransaksiController::class, 'storePenjualan'])->name('api.transaksi.penjualan');
    });
    Route::apiResource('transaksi', TransaksiController::class)->except(['update', 'destroy'])->names([
        'index' => 'api.transaksi.index',
        'store' => 'api.transaksi.store',
        'show' => 'api.transaksi.show',
    ]);

    // Permintaan Unit
    Route::prefix('permintaan')->group(function () {
        Route::get('/pending', [PermintaanUnitController::class, 'pending'])->name('api.permintaan.pending');
        Route::get('/urgent', [PermintaanUnitController::class, 'urgent'])->name('api.permintaan.urgent');
        Route::post('/{permintaan}/process', [PermintaanUnitController::class, 'process'])->name('api.permintaan.process');
        Route::post('/{permintaan}/complete', [PermintaanUnitController::class, 'complete'])->name('api.permintaan.complete');
        Route::post('/{permintaan}/cancel', [PermintaanUnitController::class, 'cancel'])->name('api.permintaan.cancel');
    });
    Route::apiResource('permintaan', PermintaanUnitController::class)->names([
        'index' => 'api.permintaan.index',
        'store' => 'api.permintaan.store',
        'show' => 'api.permintaan.show',
        'update' => 'api.permintaan.update',
        'destroy' => 'api.permintaan.destroy',
    ]);

    // QR Code
    Route::prefix('qr')->group(function () {
        Route::get('/generate/{batch}', [QrCodeController::class, 'generate'])->name('api.qr.generate');
        Route::post('/scan', [QrCodeController::class, 'scan'])->name('api.qr.scan');
        Route::get('/scan-logs', [QrCodeController::class, 'scanLogs'])->name('api.qr.scan-logs');
    });

    // Notifikasi
    Route::prefix('notifikasi')->group(function () {
        Route::get('/', [NotifikasiController::class, 'index'])->name('api.notifikasi.index');
        Route::get('/unread', [NotifikasiController::class, 'unread'])->name('api.notifikasi.unread');
        Route::get('/unread-count', [NotifikasiController::class, 'unreadCount'])->name('api.notifikasi.unread-count');
        Route::post('/{notifikasi}/read', [NotifikasiController::class, 'markAsRead'])->name('api.notifikasi.mark-as-read');
        Route::post('/read-all', [NotifikasiController::class, 'markAllAsRead'])->name('api.notifikasi.mark-all-as-read');
    });

    // Resep (Prescription)
    Route::prefix('resep')->group(function () {
        Route::get('/pending', [ResepController::class, 'pending'])->name('api.resep.pending');
        Route::post('/{resep}/process', [ResepController::class, 'process'])->name('api.resep.process');
        Route::post('/{resep}/complete', [ResepController::class, 'complete'])->name('api.resep.complete');
    });
    Route::apiResource('resep', ResepController::class)->names([
        'index' => 'api.resep.index',
        'store' => 'api.resep.store',
        'show' => 'api.resep.show',
        'update' => 'api.resep.update',
        'destroy' => 'api.resep.destroy',
    ]);

    // Stok Opname (Stock Taking)
    Route::prefix('stok-opname')->group(function () {
        Route::get('/pending-approval', [StokOpnameController::class, 'pendingApproval'])->name('api.stok-opname.pending-approval');
        Route::post('/{stokOpname}/complete', [StokOpnameController::class, 'complete'])->name('api.stok-opname.complete');
        Route::post('/{stokOpname}/approve', [StokOpnameController::class, 'approve'])->name('api.stok-opname.approve');
    });
    Route::apiResource('stok-opname', StokOpnameController::class)->names([
        'index' => 'api.stok-opname.index',
        'store' => 'api.stok-opname.store',
        'show' => 'api.stok-opname.show',
        'update' => 'api.stok-opname.update',
        'destroy' => 'api.stok-opname.destroy',
    ]);

    // Pemusnahan Obat (Drug Destruction)
    Route::prefix('pemusnahan')->group(function () {
        Route::get('/eligible', [PemusnahanObatController::class, 'eligibleForDestruction'])->name('api.pemusnahan.eligible');
        Route::get('/pending-approval', [PemusnahanObatController::class, 'pendingApproval'])->name('api.pemusnahan.pending-approval');
        Route::post('/{pemusnahanObat}/upload-ba', [PemusnahanObatController::class, 'uploadBeritaAcara'])->name('api.pemusnahan.upload-ba');
        Route::post('/{pemusnahanObat}/approve', [PemusnahanObatController::class, 'approve'])->name('api.pemusnahan.approve');
    });
    Route::apiResource('pemusnahan', PemusnahanObatController::class)->names([
        'index' => 'api.pemusnahan.index',
        'store' => 'api.pemusnahan.store',
        'show' => 'api.pemusnahan.show',
        'update' => 'api.pemusnahan.update',
        'destroy' => 'api.pemusnahan.destroy',
    ]);

    // Reports (Manager & Admin access)
    Route::prefix('reports')->group(function () {
        Route::get('/stock', [ReportController::class, 'stockReport'])->name('api.reports.stock');
        Route::get('/transactions', [ReportController::class, 'transactionReport'])->name('api.reports.transactions');
        Route::get('/expiry', [ReportController::class, 'expiryReport'])->name('api.reports.expiry');
        Route::get('/unit-requests', [ReportController::class, 'unitRequestReport'])->name('api.reports.unit-requests');
        Route::get('/export/{type}', [ReportController::class, 'export'])->name('api.reports.export');
    });

    // Master Data Management
    Route::prefix('kategori')->group(function () {
        Route::get('/active', [KategoriObatController::class, 'active'])->name('api.kategori.active');
        Route::post('/{kategoriObat}/toggle-status', [KategoriObatController::class, 'toggleStatus'])->name('api.kategori.toggle-status');
    });
    Route::apiResource('kategori', KategoriObatController::class)->names([
        'index' => 'api.kategori.index',
        'store' => 'api.kategori.store',
        'show' => 'api.kategori.show',
        'update' => 'api.kategori.update',
        'destroy' => 'api.kategori.destroy',
    ]);

    Route::prefix('jenis')->group(function () {
        Route::get('/active', [JenisObatController::class, 'active'])->name('api.jenis.active');
        Route::post('/{jenisObat}/toggle-status', [JenisObatController::class, 'toggleStatus'])->name('api.jenis.toggle-status');
    });
    Route::apiResource('jenis', JenisObatController::class)->names([
        'index' => 'api.jenis.index',
        'store' => 'api.jenis.store',
        'show' => 'api.jenis.show',
        'update' => 'api.jenis.update',
        'destroy' => 'api.jenis.destroy',
    ]);

    Route::prefix('satuan')->group(function () {
        Route::get('/active', [SatuanObatController::class, 'active'])->name('api.satuan.active');
        Route::post('/{satuanObat}/toggle-status', [SatuanObatController::class, 'toggleStatus'])->name('api.satuan.toggle-status');
    });
    Route::apiResource('satuan', SatuanObatController::class)->names([
        'index' => 'api.satuan.index',
        'store' => 'api.satuan.store',
        'show' => 'api.satuan.show',
        'update' => 'api.satuan.update',
        'destroy' => 'api.satuan.destroy',
    ]);

    Route::prefix('unit')->group(function () {
        Route::get('/active', [UnitRumahSakitController::class, 'active'])->name('api.unit.active');
        Route::get('/{unitRumahSakit}/statistics', [UnitRumahSakitController::class, 'statistics'])->name('api.unit.statistics');
        Route::post('/{unitRumahSakit}/toggle-status', [UnitRumahSakitController::class, 'toggleStatus'])->name('api.unit.toggle-status');
    });
    Route::apiResource('unit', UnitRumahSakitController::class)->names([
        'index' => 'api.unit.index',
        'store' => 'api.unit.store',
        'show' => 'api.unit.show',
        'update' => 'api.unit.update',
        'destroy' => 'api.unit.destroy',
    ]);

    Route::prefix('supplier')->group(function () {
        Route::get('/active', [SupplierController::class, 'active'])->name('api.supplier.active');
        Route::get('/{supplier}/statistics', [SupplierController::class, 'statistics'])->name('api.supplier.statistics');
        Route::post('/{supplier}/toggle-status', [SupplierController::class, 'toggleStatus'])->name('api.supplier.toggle-status');
    });
    Route::apiResource('supplier', SupplierController::class)->names([
        'index' => 'api.supplier.index',
        'store' => 'api.supplier.store',
        'show' => 'api.supplier.show',
        'update' => 'api.supplier.update',
        'destroy' => 'api.supplier.destroy',
    ]);

    // Admin only routes
    Route::middleware(['can:manage-users'])->group(function () {
        // User Management
        Route::apiResource('users', UserController::class)->names([
            'index' => 'api.users.index',
            'store' => 'api.users.store',
            'show' => 'api.users.show',
            'update' => 'api.users.update',
            'destroy' => 'api.users.destroy',
        ]);
        Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('api.users.toggle-active');

        // Activity Logs
        Route::get('/log-aktivitas', [LogAktivitasController::class, 'index'])->name('api.log-aktivitas.index');
        Route::get('/log-aktivitas/{log}', [LogAktivitasController::class, 'show'])->name('api.log-aktivitas.show');
        Route::get('/log-aktivitas/user/{user}', [LogAktivitasController::class, 'byUser'])->name('api.log-aktivitas.by-user');
    });
});
