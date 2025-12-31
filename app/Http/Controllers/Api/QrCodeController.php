<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatchObat;
use App\Models\LogAktivitas;
use App\Models\QrScanLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeController extends Controller
{
    /**
     * Generate QR code for a batch
     */
    public function generate(BatchObat $batch): JsonResponse
    {
        $batch->load('obat');

        // Generate QR code as base64
        $qrCode = QrCode::size(300)
            ->format('png')
            ->generate($batch->qr_json);

        $qrCodeBase64 = base64_encode($qrCode);

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
}
