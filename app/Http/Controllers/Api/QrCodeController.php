<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatchObat;
use App\Models\LogAktivitas;
use App\Models\QrScanLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class QrCodeController extends Controller
{
    /**
     * Generate QR code for a batch
     */
    public function generate(BatchObat $batch): JsonResponse
    {
        $batch->load('obat');

        // Generate QR code using endroid/qr-code
        $qrCode = QrCode::create($batch->qr_json)
            ->setSize(300)
            ->setMargin(10);

        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        $qrCodeBase64 = base64_encode($result->getString());

        LogAktivitas::log(
            auth()->user(),
            "Generate QR Code untuk batch: {$batch->nomor_batch}",
            'qr_code',
            'generate',
            $batch
        );

        return response()->json([
            'batch' => $batch,
            'qr_code' => 'data:image/png;base64,' . $qrCodeBase64,
            'qr_data' => $batch->qr_data,
            'kode_qr' => $batch->kode_qr,
        ]);
    }

    /**
     * Scan QR code
     */
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'kode_qr' => 'required|string',
            'metode' => 'required|in:camera,scanner',
        ]);

        $kodeQr = $request->kode_qr;
        $metode = $request->metode;

        // Find batch by QR code
        $batch = BatchObat::with(['obat.kategori', 'obat.jenis', 'obat.satuan'])
            ->where('kode_qr', $kodeQr)
            ->first();

        if (!$batch) {
            // Log failed scan
            QrScanLog::logScan(
                $kodeQr,
                $metode,
                QrScanLog::HASIL_NOT_FOUND,
                null,
                auth()->user(),
                'QR Code tidak ditemukan'
            );

            return response()->json([
                'success' => false,
                'message' => 'QR Code tidak ditemukan',
            ], 404);
        }

        // Check if expired
        if ($batch->isExpired()) {
            QrScanLog::logScan(
                $kodeQr,
                $metode,
                QrScanLog::HASIL_EXPIRED,
                $batch,
                auth()->user(),
                'Batch sudah kadaluarsa',
                $batch->qr_data
            );

            return response()->json([
                'success' => false,
                'message' => 'Batch sudah kadaluarsa',
                'batch' => $batch,
            ], 400);
        }

        // Log successful scan
        QrScanLog::logScan(
            $kodeQr,
            $metode,
            QrScanLog::HASIL_SUCCESS,
            $batch,
            auth()->user(),
            null,
            $batch->qr_data
        );

        LogAktivitas::log(
            auth()->user(),
            "Scan QR Code batch: {$batch->nomor_batch}",
            'qr_code',
            LogAktivitas::AKSI_SCAN,
            $batch
        );

        return response()->json([
            'success' => true,
            'message' => 'QR Code berhasil dipindai',
            'batch' => $batch,
            'obat' => $batch->obat,
        ]);
    }

    /**
     * Get scan logs
     */
    public function scanLogs(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $hasil = $request->get('hasil');

        $query = QrScanLog::with(['batch.obat', 'user'])
            ->latest('waktu_scan');

        if ($hasil) {
            $query->where('hasil_scan', $hasil);
        }

        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get QR scan analytics/statistics
     */
    public function analytics(Request $request): JsonResponse
    {
        $period = $request->get('period', 'today'); // today, week, month, all

        // Define date ranges
        $dateFrom = match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => null,
        };

        // Base query
        $query = QrScanLog::query();
        if ($dateFrom) {
            $query->where('waktu_scan', '>=', $dateFrom);
        }

        // Total scans
        $totalScans = $query->count();

        // Scans by result
        $scansByResult = QrScanLog::selectRaw('hasil_scan, COUNT(*) as count')
            ->when($dateFrom, fn($q) => $q->where('waktu_scan', '>=', $dateFrom))
            ->groupBy('hasil_scan')
            ->get()
            ->pluck('count', 'hasil_scan');

        // Scans by method
        $scansByMethod = QrScanLog::selectRaw('metode_scan, COUNT(*) as count')
            ->when($dateFrom, fn($q) => $q->where('waktu_scan', '>=', $dateFrom))
            ->groupBy('metode_scan')
            ->get()
            ->pluck('count', 'metode_scan');

        // Most scanned batches
        $mostScannedBatches = QrScanLog::selectRaw('batch_id, COUNT(*) as scan_count')
            ->with(['batch.obat'])
            ->when($dateFrom, fn($q) => $q->where('waktu_scan', '>=', $dateFrom))
            ->whereNotNull('batch_id')
            ->groupBy('batch_id')
            ->orderByDesc('scan_count')
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'batch_id' => $log->batch_id,
                'batch' => $log->batch,
                'scan_count' => $log->scan_count,
            ]);

        // Most scanned medicines
        $mostScannedMedicines = QrScanLog::selectRaw('COUNT(*) as scan_count')
            ->with(['batch.obat'])
            ->when($dateFrom, fn($q) => $q->where('waktu_scan', '>=', $dateFrom))
            ->whereHas('batch')
            ->get()
            ->groupBy(fn($log) => $log->batch?->obat?->id)
            ->map(fn($logs) => [
                'obat_id' => $logs->first()->batch?->obat?->id,
                'obat' => $logs->first()->batch?->obat,
                'scan_count' => $logs->count(),
            ])
            ->sortByDesc('scan_count')
            ->take(10)
            ->values();

        // Scans by user (top 10)
        $scansByUser = QrScanLog::selectRaw('user_id, COUNT(*) as scan_count')
            ->with('user:id,name,email')
            ->when($dateFrom, fn($q) => $q->where('waktu_scan', '>=', $dateFrom))
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('scan_count')
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'user_id' => $log->user_id,
                'user' => $log->user,
                'scan_count' => $log->scan_count,
            ]);

        // Scans by hour (for today)
        $scansByHour = [];
        if ($period === 'today') {
            $scansByHour = QrScanLog::selectRaw('HOUR(waktu_scan) as hour, COUNT(*) as count')
                ->where('waktu_scan', '>=', now()->startOfDay())
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
                ->pluck('count', 'hour')
                ->toArray();

            // Fill missing hours with 0
            for ($i = 0; $i < 24; $i++) {
                if (!isset($scansByHour[$i])) {
                    $scansByHour[$i] = 0;
                }
            }
            ksort($scansByHour);
        }

        // Scans trend (last 7 days or 30 days)
        $trendDays = $period === 'week' ? 7 : ($period === 'month' ? 30 : 7);
        $scansTrend = [];
        for ($i = $trendDays - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = QrScanLog::whereDate('waktu_scan', $date)->count();
            $scansTrend[] = [
                'date' => $date,
                'count' => $count,
            ];
        }

        // Success rate
        $successCount = $scansByResult[QrScanLog::HASIL_SUCCESS] ?? 0;
        $successRate = $totalScans > 0 ? round(($successCount / $totalScans) * 100, 2) : 0;

        // Error rate
        $errorCount = $scansByResult[QrScanLog::HASIL_ERROR] ?? 0;
        $notFoundCount = $scansByResult[QrScanLog::HASIL_NOT_FOUND] ?? 0;
        $totalErrors = $errorCount + $notFoundCount;
        $errorRate = $totalScans > 0 ? round(($totalErrors / $totalScans) * 100, 2) : 0;

        return response()->json([
            'period' => $period,
            'date_from' => $dateFrom?->format('Y-m-d H:i:s'),
            'summary' => [
                'total_scans' => $totalScans,
                'success_count' => $successCount,
                'success_rate' => $successRate,
                'error_count' => $totalErrors,
                'error_rate' => $errorRate,
                'expired_count' => $scansByResult[QrScanLog::HASIL_EXPIRED] ?? 0,
            ],
            'scans_by_result' => $scansByResult,
            'scans_by_method' => $scansByMethod,
            'most_scanned_batches' => $mostScannedBatches,
            'most_scanned_medicines' => $mostScannedMedicines,
            'scans_by_user' => $scansByUser,
            'scans_by_hour' => $scansByHour,
            'scans_trend' => $scansTrend,
        ]);
    }
}
