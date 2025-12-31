<?php

namespace App\Http\Controllers\Api;

use App\Events\StokUpdated;
use App\Events\TransaksiCreated;
use App\Http\Controllers\Controller;
use App\Models\BatchObat;
use App\Models\LogAktivitas;
use App\Models\Notifikasi;
use App\Models\Obat;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransaksiController extends Controller
{
    /**
     * Display a listing of transactions
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $jenis = $request->get('jenis');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = Transaksi::with(['obat', 'batch', 'user', 'unit'])
            ->latest('tanggal_transaksi')
            ->latest('waktu_transaksi');

        if ($jenis) {
            $query->where('jenis_transaksi', $jenis);
        }

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        $transaksi = $query->paginate($perPage);

        return response()->json($transaksi);
    }

    /**
     * Display the specified transaction
     */
    public function show(Transaksi $transaksi): JsonResponse
    {
        $transaksi->load(['obat', 'batch', 'user', 'unit']);
        
        return response()->json($transaksi);
    }

    /**
     * Store incoming transaction (barang masuk)
     */
    public function storeMasuk(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'batch_id' => 'required|exists:batch_obat,id',
            'jumlah' => 'required|integer|min:1',
            'harga_satuan' => 'required|numeric|min:0',
            'nomor_referensi' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $batch = BatchObat::findOrFail($request->batch_id);
            $obat = $batch->obat;
            $oldStok = $obat->stok_total;

            // Update batch stock
            $batch->stok_tersedia += $request->jumlah;
            $batch->save();

            // Create transaction
            $transaksi = Transaksi::create([
                'obat_id' => $obat->id,
                'batch_id' => $batch->id,
                'user_id' => auth()->id(),
                'jenis_transaksi' => Transaksi::JENIS_MASUK,
                'jumlah' => $request->jumlah,
                'harga_satuan' => $request->harga_satuan,
                'total_harga' => $request->jumlah * $request->harga_satuan,
                'nomor_referensi' => $request->nomor_referensi,
                'keterangan' => $request->keterangan,
            ]);

            // Update medicine total stock
            $obat->recalculateStok();

            // Log activity
            LogAktivitas::log(
                auth()->user(),
                "Transaksi masuk: {$request->jumlah} {$obat->nama_obat}",
                'transaksi',
                LogAktivitas::AKSI_CREATE,
                $transaksi
            );

            // Broadcast real-time update
            broadcast(new StokUpdated($obat, 'masuk', $oldStok, $obat->stok_total))->toOthers();
            broadcast(new TransaksiCreated($transaksi))->toOthers();

            return response()->json($transaksi->load(['obat', 'batch', 'user']), 201);
        });
    }

    /**
     * Store outgoing transaction (barang keluar)
     */
    public function storeKeluar(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'obat_id' => 'required|exists:obat,id',
            'unit_id' => 'required|exists:unit_rumah_sakit,id',
            'jumlah' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $obat = Obat::findOrFail($request->obat_id);
            $oldStok = $obat->stok_total;
            $jumlahKeluar = $request->jumlah;

            // Check if enough stock
            if ($obat->stok_total < $jumlahKeluar) {
                return response()->json([
                    'message' => 'Stok tidak mencukupi',
                    'available' => $obat->stok_total,
                    'requested' => $jumlahKeluar,
                ], 400);
            }

            // Get batches FEFO order
            $batches = $obat->activeBatches()->get();
            $remainingQty = $jumlahKeluar;
            $usedBatches = [];

            foreach ($batches as $batch) {
                if ($remainingQty <= 0) break;

                $takeFromBatch = min($remainingQty, $batch->stok_tersedia);
                
                // Create transaction for this batch
                $transaksi = Transaksi::create([
                    'obat_id' => $obat->id,
                    'batch_id' => $batch->id,
                    'user_id' => auth()->id(),
                    'unit_id' => $request->unit_id,
                    'jenis_transaksi' => Transaksi::JENIS_KELUAR,
                    'jumlah' => $takeFromBatch,
                    'harga_satuan' => $obat->harga_jual,
                    'total_harga' => $takeFromBatch * $obat->harga_jual,
                    'keterangan' => $request->keterangan,
                ]);

                // Update batch stock
                $batch->stok_tersedia -= $takeFromBatch;
                $batch->save();

                $remainingQty -= $takeFromBatch;
                $usedBatches[] = $transaksi;

                // Log activity
                LogAktivitas::log(
                    auth()->user(),
                    "Transaksi keluar: {$takeFromBatch} {$obat->nama_obat} (Batch: {$batch->nomor_batch})",
                    'transaksi',
                    LogAktivitas::AKSI_CREATE,
                    $transaksi
                );

                // Broadcast
                broadcast(new TransaksiCreated($transaksi))->toOthers();
            }

            // Update medicine total stock
            $obat->recalculateStok();

            // Check for low stock and create notification
            if ($obat->isStokRendah()) {
                $notification = Notifikasi::notifyStokRendah($obat);
                broadcast(new \App\Events\NotifikasiCreated($notification))->toOthers();
            }

            // Broadcast stock update
            broadcast(new StokUpdated($obat, 'keluar', $oldStok, $obat->stok_total))->toOthers();

            return response()->json([
                'message' => 'Transaksi keluar berhasil',
                'transactions' => $usedBatches,
                'total_qty' => $jumlahKeluar,
            ], 201);
        });
    }

    /**
     * Store sales transaction (penjualan)
     */
    public function storePenjualan(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'obat_id' => 'required|exists:obat,id',
            'jumlah' => 'required|integer|min:1',
            'harga_satuan' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $obat = Obat::findOrFail($request->obat_id);
            $oldStok = $obat->stok_total;

            // Check stock
            if ($obat->stok_total < $request->jumlah) {
                return response()->json([
                    'message' => 'Stok tidak mencukupi',
                    'available' => $obat->stok_total,
                ], 400);
            }

            // Get next batch (FEFO)
            $batch = $obat->getNextBatchFefo();
            
            if (!$batch || $batch->stok_tersedia < $request->jumlah) {
                return response()->json(['message' => 'Batch tidak tersedia'], 400);
            }

            // Create transaction
            $transaksi = Transaksi::create([
                'obat_id' => $obat->id,
                'batch_id' => $batch->id,
                'user_id' => auth()->id(),
                'jenis_transaksi' => Transaksi::JENIS_PENJUALAN,
                'jumlah' => $request->jumlah,
                'harga_satuan' => $request->harga_satuan,
                'total_harga' => $request->jumlah * $request->harga_satuan,
                'keterangan' => $request->keterangan,
            ]);

            // Update batch stock
            $batch->stok_tersedia -= $request->jumlah;
            $batch->save();

            // Update medicine stock
            $obat->recalculateStok();

            // Log activity
            LogAktivitas::log(
                auth()->user(),
                "Penjualan: {$request->jumlah} {$obat->nama_obat}",
                'transaksi',
                LogAktivitas::AKSI_CREATE,
                $transaksi
            );

            // Broadcast
            broadcast(new StokUpdated($obat, 'penjualan', $oldStok, $obat->stok_total))->toOthers();
            broadcast(new TransaksiCreated($transaksi))->toOthers();

            return response()->json($transaksi->load(['obat', 'batch', 'user']), 201);
        });
    }

    /**
     * Get today's transactions
     */
    public function today(Request $request): JsonResponse
    {
        $transaksi = Transaksi::with(['obat', 'batch', 'user', 'unit'])
            ->today()
            ->latest('waktu_transaksi')
            ->get();

        return response()->json($transaksi);
    }

    /**
     * Get transactions by type
     */
    public function byType(Request $request, string $type): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        
        $transaksi = Transaksi::with(['obat', 'batch', 'user', 'unit'])
            ->where('jenis_transaksi', $type)
            ->latest('tanggal_transaksi')
            ->latest('waktu_transaksi')
            ->paginate($perPage);

        return response()->json($transaksi);
    }
}
