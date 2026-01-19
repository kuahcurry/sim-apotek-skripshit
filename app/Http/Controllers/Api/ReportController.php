<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatchObat;
use App\Models\Obat;
use App\Models\PermintaanUnit;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Generate stock report.
     */
    public function stockReport(Request $request): JsonResponse
    {
        $query = Obat::with(['kategori:id,nama', 'jenis:id,nama', 'satuan:id,nama'])
            ->withCount('batches');

        // Filter by kategori
        if ($request->has('kategori_id')) {
            $query->where('kategori_obat_id', $request->kategori_id);
        }

        // Filter by jenis
        if ($request->has('jenis_id')) {
            $query->where('jenis_obat_id', $request->jenis_id);
        }

        // Filter by low stock
        if ($request->boolean('low_stock_only')) {
            $query->whereRaw('stok_total < stok_minimum');
        }

        $obats = $query->orderBy('nama_obat')->get();

        $summary = [
            'total_items' => $obats->count(),
            'low_stock_items' => $obats->filter(fn($o) => $o->isStokRendah())->count(),
            'total_value' => $obats->sum(fn($o) => $o->stok_total * $o->harga_beli),
        ];

        return response()->json([
            'summary' => $summary,
            'data' => $obats,
        ]);
    }

    /**
     * Generate transaction report.
     */
    public function transactionReport(Request $request): JsonResponse
    {
        $query = Transaksi::with(['obat:id,nama_obat', 'batch:id,no_batch', 'user:id,name', 'unit:id,nama']);

        // Date range filter
        if ($request->has('date_from')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->date_to);
        }

        // Filter by type
        if ($request->has('jenis_transaksi')) {
            $query->where('jenis_transaksi', $request->jenis_transaksi);
        }

        // Filter by obat
        if ($request->has('obat_id')) {
            $query->where('obat_id', $request->obat_id);
        }

        $transaksis = $query->latest('tanggal_transaksi')->get();

        $summary = [
            'total_transactions' => $transaksis->count(),
            'by_type' => [
                'masuk' => $transaksis->where('jenis_transaksi', Transaksi::JENIS_MASUK)->count(),
                'keluar' => $transaksis->where('jenis_transaksi', Transaksi::JENIS_KELUAR)->count(),
                'penjualan' => $transaksis->where('jenis_transaksi', Transaksi::JENIS_PENJUALAN)->count(),
            ],
            'total_value' => [
                'masuk' => $transaksis->where('jenis_transaksi', Transaksi::JENIS_MASUK)
                    ->sum(fn($t) => $t->jumlah * $t->harga_satuan),
                'keluar' => $transaksis->where('jenis_transaksi', Transaksi::JENIS_KELUAR)
                    ->sum(fn($t) => $t->jumlah * $t->harga_satuan),
                'penjualan' => $transaksis->where('jenis_transaksi', Transaksi::JENIS_PENJUALAN)
                    ->sum(fn($t) => $t->jumlah * $t->harga_satuan),
            ],
        ];

        return response()->json([
            'summary' => $summary,
            'data' => $transaksis,
        ]);
    }

    /**
     * Generate expiry report.
     */
    public function expiryReport(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);

        $expiringSoon = BatchObat::with(['obat:id,nama_obat,kode_obat', 'supplier:id,nama'])
            ->expiringSoon($days)
            ->where('status', BatchObat::STATUS_AVAILABLE)
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired')
            ->get();

        $expired = BatchObat::with(['obat:id,nama_obat,kode_obat', 'supplier:id,nama'])
            ->expired()
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired', 'desc')
            ->get();

        $summary = [
            'expiring_soon_count' => $expiringSoon->count(),
            'expiring_soon_value' => $expiringSoon->sum(fn($b) => $b->stok_tersedia * $b->harga_beli_satuan),
            'expired_count' => $expired->count(),
            'expired_value' => $expired->sum(fn($b) => $b->stok_tersedia * $b->harga_beli_satuan),
        ];

        return response()->json([
            'summary' => $summary,
            'expiring_soon' => $expiringSoon,
            'expired' => $expired,
        ]);
    }

    /**
     * Generate unit request report.
     */
    public function unitRequestReport(Request $request): JsonResponse
    {
        $query = PermintaanUnit::with(['unit:id,nama', 'obat:id,nama_obat', 'createdBy:id,name', 'processedBy:id,name']);

        // Date range filter
        if ($request->has('date_from')) {
            $query->whereDate('tanggal_permintaan', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('tanggal_permintaan', '<=', $request->date_to);
        }

        // Filter by unit
        if ($request->has('unit_id')) {
            $query->where('unit_rumah_sakit_id', $request->unit_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $permintaans = $query->latest('tanggal_permintaan')->get();

        $summary = [
            'total_requests' => $permintaans->count(),
            'by_status' => [
                'pending' => $permintaans->where('status', PermintaanUnit::STATUS_PENDING)->count(),
                'processed' => $permintaans->where('status', PermintaanUnit::STATUS_PROCESSED)->count(),
                'completed' => $permintaans->where('status', PermintaanUnit::STATUS_COMPLETED)->count(),
                'rejected' => $permintaans->where('status', PermintaanUnit::STATUS_REJECTED)->count(),
            ],
            'urgent_requests' => $permintaans->where('is_urgent', true)->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'data' => $permintaans,
        ]);
    }

    /**
     * Export report to PDF/Excel (placeholder).
     */
    public function export(Request $request, string $type): JsonResponse
    {
        // This would require packages like maatwebsite/excel or barryvdh/laravel-dompdf
        // For now, return placeholder response

        $reportType = $request->get('report_type', 'stock');
        
        return response()->json([
            'message' => 'Export functionality requires additional packages',
            'info' => 'Install maatwebsite/excel for Excel export or barryvdh/laravel-dompdf for PDF',
            'type' => $type,
            'report_type' => $reportType,
        ], 501);
    }
}
