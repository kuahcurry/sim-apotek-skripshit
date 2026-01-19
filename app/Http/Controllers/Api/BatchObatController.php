<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BatchObat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BatchObatController extends Controller
{
    /**
     * Display a listing of batches.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BatchObat::with(['obat:id,nama_obat,kode_obat', 'supplier:id,nama']);

        // Filter by obat
        if ($request->has('obat_id')) {
            $query->where('obat_id', $request->obat_id);
        }

        // Filter by supplier
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_batch', 'like', "%{$search}%")
                  ->orWhere('kode_qr', 'like', "%{$search}%");
            });
        }

        // Sorting (FEFO by default)
        $sortBy = $request->get('sort_by', 'tanggal_expired');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $batches = $query->paginate($perPage);

        return response()->json($batches);
    }

    /**
     * Get expiring soon batches (within 30 days).
     */
    public function expiringSoon(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        
        $batches = BatchObat::with(['obat:id,nama_obat,kode_obat', 'supplier:id,nama'])
            ->expiringSoon($days)
            ->where('status', BatchObat::STATUS_AVAILABLE)
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired')
            ->get();

        return response()->json($batches);
    }

    /**
     * Get expired batches.
     */
    public function expired(Request $request): JsonResponse
    {
        $batches = BatchObat::with(['obat:id,nama_obat,kode_obat', 'supplier:id,nama'])
            ->expired()
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($batches);
    }

    /**
     * Display the specified batch.
     */
    public function show(BatchObat $batch): JsonResponse
    {
        $batch->load(['obat', 'supplier', 'transaksi.user', 'qrScanLogs']);

        return response()->json($batch);
    }

    /**
     * Update batch status (e.g., quarantine, empty).
     */
    public function updateStatus(Request $request, BatchObat $batch): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:' . implode(',', [
                BatchObat::STATUS_AVAILABLE,
                BatchObat::STATUS_QUARANTINE,
                BatchObat::STATUS_EXPIRED,
                BatchObat::STATUS_EMPTY,
            ]),
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $batch->update([
            'status' => $request->status,
            'keterangan' => $request->keterangan ?? $batch->keterangan,
        ]);

        // If set to expired, could trigger notification
        if ($request->status === BatchObat::STATUS_EXPIRED) {
            // Notify about expired batch
        }

        return response()->json([
            'message' => 'Status batch berhasil diperbarui',
            'data' => $batch,
        ]);
    }

    /**
     * Get batch statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_batches' => BatchObat::count(),
            'available_batches' => BatchObat::where('status', BatchObat::STATUS_AVAILABLE)
                ->where('stok_tersedia', '>', 0)
                ->count(),
            'quarantine_batches' => BatchObat::where('status', BatchObat::STATUS_QUARANTINE)->count(),
            'expired_batches' => BatchObat::expired()->count(),
            'expiring_soon' => BatchObat::expiringSoon(30)
                ->where('status', BatchObat::STATUS_AVAILABLE)
                ->count(),
        ];

        return response()->json($stats);
    }
}
