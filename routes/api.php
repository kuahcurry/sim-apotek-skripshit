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
    Route::apiResource('kategori-obat', KategoriObatController::class);

    // Master Data - Jenis Obat
    Route::apiResource('jenis-obat', JenisObatController::class);

    // Master Data - Satuan Obat
    Route::apiResource('satuan-obat', SatuanObatController::class);

    // Master Data - Unit Rumah Sakit
    Route::apiResource('unit-rumah-sakit', UnitRumahSakitController::class);

    // Obat (Medicine)
    Route::prefix('obat')->group(function () {
        Route::get('/low-stock', [ObatController::class, 'lowStock']);
        Route::get('/search', [ObatController::class, 'search']);
        Route::get('/{obat}/batches', [ObatController::class, 'batches']);
        Route::post('/{obat}/recalculate-stock', [ObatController::class, 'recalculateStock']);
    });
    Route::apiResource('obat', ObatController::class);

    // Batch Obat
    Route::prefix('batch')->group(function () {
        Route::get('/expiring-soon', [BatchObatController::class, 'expiringSoon']);
        Route::get('/expired', [BatchObatController::class, 'expired']);
        Route::post('/{batch}/update-status', [BatchObatController::class, 'updateStatus']);
    });
    Route::apiResource('batch', BatchObatController::class);

    // Transaksi
    Route::prefix('transaksi')->group(function () {
        Route::get('/today', [TransaksiController::class, 'today']);
        Route::get('/by-type/{type}', [TransaksiController::class, 'byType']);
        Route::post('/masuk', [TransaksiController::class, 'storeMasuk']);
        Route::post('/keluar', [TransaksiController::class, 'storeKeluar']);
        Route::post('/penjualan', [TransaksiController::class, 'storePenjualan']);
    });
    Route::apiResource('transaksi', TransaksiController::class)->except(['update', 'destroy']);

    // Permintaan Unit
    Route::prefix('permintaan')->group(function () {
        Route::get('/pending', [PermintaanUnitController::class, 'pending']);
        Route::get('/urgent', [PermintaanUnitController::class, 'urgent']);
        Route::post('/{permintaan}/process', [PermintaanUnitController::class, 'process']);
        Route::post('/{permintaan}/complete', [PermintaanUnitController::class, 'complete']);
        Route::post('/{permintaan}/cancel', [PermintaanUnitController::class, 'cancel']);
    });
    Route::apiResource('permintaan', PermintaanUnitController::class);

    // QR Code
    Route::prefix('qr')->group(function () {
        Route::get('/generate/{batch}', [QrCodeController::class, 'generate']);
        Route::post('/scan', [QrCodeController::class, 'scan']);
        Route::get('/scan-logs', [QrCodeController::class, 'scanLogs']);
    });

    // Notifikasi
    Route::prefix('notifikasi')->group(function () {
        Route::get('/', [NotifikasiController::class, 'index']);
        Route::get('/unread', [NotifikasiController::class, 'unread']);
        Route::get('/unread-count', [NotifikasiController::class, 'unreadCount']);
        Route::post('/{notifikasi}/read', [NotifikasiController::class, 'markAsRead']);
        Route::post('/read-all', [NotifikasiController::class, 'markAllAsRead']);
    });

    // Resep (Prescription)
    Route::prefix('resep')->group(function () {
        Route::get('/pending', [ResepController::class, 'pending']);
        Route::post('/{resep}/process', [ResepController::class, 'process']);
        Route::post('/{resep}/complete', [ResepController::class, 'complete']);
    });
    Route::apiResource('resep', ResepController::class);

    // Stok Opname (Stock Taking)
    Route::prefix('stok-opname')->group(function () {
        Route::get('/pending-approval', [StokOpnameController::class, 'pendingApproval']);
        Route::post('/{stokOpname}/complete', [StokOpnameController::class, 'complete']);
        Route::post('/{stokOpname}/approve', [StokOpnameController::class, 'approve']);
    });
    Route::apiResource('stok-opname', StokOpnameController::class);

    // Pemusnahan Obat (Drug Destruction)
    Route::prefix('pemusnahan')->group(function () {
        Route::get('/eligible', [PemusnahanObatController::class, 'eligibleForDestruction']);
        Route::get('/pending-approval', [PemusnahanObatController::class, 'pendingApproval']);
        Route::post('/{pemusnahanObat}/upload-ba', [PemusnahanObatController::class, 'uploadBeritaAcara']);
        Route::post('/{pemusnahanObat}/approve', [PemusnahanObatController::class, 'approve']);
    });
    Route::apiResource('pemusnahan', PemusnahanObatController::class);

    // Reports (Manager & Admin access)
    Route::prefix('reports')->group(function () {
        Route::get('/stock', [ReportController::class, 'stockReport']);
        Route::get('/transactions', [ReportController::class, 'transactionReport']);
        Route::get('/expiry', [ReportController::class, 'expiryReport']);
        Route::get('/unit-requests', [ReportController::class, 'unitRequestReport']);
        Route::get('/export/{type}', [ReportController::class, 'export']);
    });

    // Master Data Management
    Route::prefix('kategori')->group(function () {
        Route::get('/active', [KategoriObatController::class, 'active']);
        Route::post('/{kategoriObat}/toggle-status', [KategoriObatController::class, 'toggleStatus']);
    });
    Route::apiResource('kategori', KategoriObatController::class);

    Route::prefix('jenis')->group(function () {
        Route::get('/active', [JenisObatController::class, 'active']);
        Route::post('/{jenisObat}/toggle-status', [JenisObatController::class, 'toggleStatus']);
    });
    Route::apiResource('jenis', JenisObatController::class);

    Route::prefix('satuan')->group(function () {
        Route::get('/active', [SatuanObatController::class, 'active']);
        Route::post('/{satuanObat}/toggle-status', [SatuanObatController::class, 'toggleStatus']);
    });
    Route::apiResource('satuan', SatuanObatController::class);

    Route::prefix('unit')->group(function () {
        Route::get('/active', [UnitRumahSakitController::class, 'active']);
        Route::get('/{unitRumahSakit}/statistics', [UnitRumahSakitController::class, 'statistics']);
        Route::post('/{unitRumahSakit}/toggle-status', [UnitRumahSakitController::class, 'toggleStatus']);
    });
    Route::apiResource('unit', UnitRumahSakitController::class);

    Route::prefix('supplier')->group(function () {
        Route::get('/active', [SupplierController::class, 'active']);
        Route::get('/{supplier}/statistics', [SupplierController::class, 'statistics']);
        Route::post('/{supplier}/toggle-status', [SupplierController::class, 'toggleStatus']);
    });
    Route::apiResource('supplier', SupplierController::class);

    // Admin only routes
    Route::middleware(['can:manage-users'])->group(function () {
        // User Management
        Route::apiResource('users', UserController::class);
        Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        // Activity Logs
        Route::get('/log-aktivitas', [LogAktivitasController::class, 'index']);
        Route::get('/log-aktivitas/{log}', [LogAktivitasController::class, 'show']);
        Route::get('/log-aktivitas/user/{user}', [LogAktivitasController::class, 'byUser']);
    });
});
