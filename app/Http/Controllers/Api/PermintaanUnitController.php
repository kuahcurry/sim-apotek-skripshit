<?php

namespace App\Http\Controllers\Api;

use App\Events\PermintaanCreated;
use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\Notifikasi;
use App\Models\PermintaanUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermintaanUnitController extends Controller
{
    /**
     * Display a listing of requests
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        $unit = $request->get('unit');

        $query = PermintaanUnit::with(['unit', 'obat', 'processedBy'])
            ->latest('tanggal_permintaan');

        if ($status) {
            $query->where('status', $status);
        }

        if ($unit) {
            $query->where('unit_id', $unit);
        }

        $permintaan = $query->paginate($perPage);

        return response()->json($permintaan);
    }

    /**
     * Store a newly created request
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'unit_id' => 'required|exists:unit_rumah_sakit,id',
            'obat_id' => 'required|exists:obat,id',
            'jumlah_diminta' => 'required|integer|min:1',
            'prioritas' => 'required|in:normal,urgent,emergency',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $permintaan = PermintaanUnit::create($request->all());
        $permintaan->load(['unit', 'obat']);

        // Create notification for pharmacists
        $notification = Notifikasi::notifyPermintaanBaru($permintaan);
        broadcast(new \App\Events\NotifikasiCreated($notification))->toOthers();

        // Broadcast new request
        broadcast(new PermintaanCreated($permintaan))->toOthers();

        LogAktivitas::log(
            auth()->user(),
            "Permintaan baru dari {$permintaan->unit->nama_unit}: {$permintaan->jumlah_diminta} {$permintaan->obat->nama_obat}",
            'permintaan',
            LogAktivitas::AKSI_CREATE,
            $permintaan
        );

        return response()->json($permintaan, 201);
    }

    /**
     * Display the specified request
     */
    public function show(PermintaanUnit $permintaan): JsonResponse
    {
        $permintaan->load(['unit', 'obat', 'processedBy']);
        
        return response()->json($permintaan);
    }

    /**
     * Update the specified request
     */
    public function update(Request $request, PermintaanUnit $permintaan): JsonResponse
    {
        if (!$permintaan->isPending()) {
            return response()->json([
                'message' => 'Hanya permintaan dengan status pending yang bisa diubah'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'jumlah_diminta' => 'required|integer|min:1',
            'prioritas' => 'required|in:normal,urgent,emergency',
            'catatan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldData = $permintaan->toArray();
        $permintaan->update($request->all());

        LogAktivitas::log(
            auth()->user(),
            "Mengubah permintaan: {$permintaan->kode_permintaan}",
            'permintaan',
            LogAktivitas::AKSI_UPDATE,
            $permintaan,
            $oldData,
            $permintaan->toArray()
        );

        return response()->json($permintaan);
    }

    /**
     * Get pending requests
     */
    public function pending(Request $request): JsonResponse
    {
        $permintaan = PermintaanUnit::with(['unit', 'obat'])
            ->pending()
            ->latest('tanggal_permintaan')
            ->get();

        return response()->json($permintaan);
    }

    /**
     * Get urgent requests
     */
    public function urgent(Request $request): JsonResponse
    {
        $permintaan = PermintaanUnit::with(['unit', 'obat'])
            ->pending()
            ->urgent()
            ->latest('tanggal_permintaan')
            ->get();

        return response()->json($permintaan);
    }

    /**
     * Process a request
     */
    public function process(Request $request, PermintaanUnit $permintaan): JsonResponse
    {
        if (!$permintaan->isPending()) {
            return response()->json([
                'message' => 'Permintaan sudah diproses'
            ], 400);
        }

        $request->validate([
            'jumlah_disetujui' => 'nullable|integer|min:0',
            'catatan_farmasi' => 'nullable|string',
        ]);

        $permintaan->markAsProcessed(
            auth()->user(),
            $request->jumlah_disetujui,
            $request->catatan_farmasi
        );

        LogAktivitas::log(
            auth()->user(),
            "Memproses permintaan: {$permintaan->kode_permintaan}",
            'permintaan',
            LogAktivitas::AKSI_UPDATE,
            $permintaan
        );

        return response()->json([
            'message' => 'Permintaan berhasil diproses',
            'permintaan' => $permintaan->load(['unit', 'obat', 'processedBy']),
        ]);
    }

    /**
     * Complete a request
     */
    public function complete(Request $request, PermintaanUnit $permintaan): JsonResponse
    {
        $permintaan->markAsCompleted();

        LogAktivitas::log(
            auth()->user(),
            "Menyelesaikan permintaan: {$permintaan->kode_permintaan}",
            'permintaan',
            LogAktivitas::AKSI_UPDATE,
            $permintaan
        );

        return response()->json([
            'message' => 'Permintaan selesai',
            'permintaan' => $permintaan,
        ]);
    }

    /**
     * Cancel a request
     */
    public function cancel(Request $request, PermintaanUnit $permintaan): JsonResponse
    {
        $request->validate([
            'alasan' => 'nullable|string',
        ]);

        $permintaan->markAsCancelled($request->alasan);

        LogAktivitas::log(
            auth()->user(),
            "Membatalkan permintaan: {$permintaan->kode_permintaan}",
            'permintaan',
            LogAktivitas::AKSI_UPDATE,
            $permintaan
        );

        return response()->json([
            'message' => 'Permintaan dibatalkan',
            'permintaan' => $permintaan,
        ]);
    }
}
