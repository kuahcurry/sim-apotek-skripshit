<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\StokOpname;
use App\Models\StokOpnameDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StokOpnameController extends Controller
{
    /**
     * Display a listing of stock opname
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');

        $query = StokOpname::with(['penanggungJawab', 'approvedBy', 'unit'])
            ->latest('tanggal_opname');

        if ($status) {
            $query->where('status', $status);
        }

        $opname = $query->paginate($perPage);

        return response()->json($opname);
    }

    /**
     * Store a newly created stock opname
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tanggal_opname' => 'required|date',
            'penanggung_jawab' => 'required|exists:users,id',
            'unit_id' => 'nullable|exists:unit_rumah_sakit,id',
            'catatan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.batch_id' => 'required|exists:batch_obat,id',
            'details.*.stok_fisik' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            // Create stock opname
            $opname = StokOpname::create([
                'tanggal_opname' => $request->tanggal_opname,
                'penanggung_jawab' => $request->penanggung_jawab,
                'unit_id' => $request->unit_id,
                'catatan' => $request->catatan,
                'status' => StokOpname::STATUS_IN_PROGRESS,
            ]);

            // Create details
            foreach ($request->details as $detailData) {
                $batch = \App\Models\BatchObat::find($detailData['batch_id']);
                
                StokOpnameDetail::create([
                    'stok_opname_id' => $opname->id,
                    'batch_id' => $detailData['batch_id'],
                    'stok_sistem' => $batch->stok_tersedia,
                    'stok_fisik' => $detailData['stok_fisik'],
                    'keterangan_selisih' => $detailData['keterangan_selisih'] ?? null,
                ]);
            }

            LogAktivitas::log(
                auth()->user(),
                "Membuat stok opname: {$opname->nomor_opname}",
                'stok_opname',
                LogAktivitas::AKSI_CREATE,
                $opname
            );

            return response()->json($opname->load(['details.batch.obat', 'penanggungJawab']), 201);
        });
    }

    /**
     * Display the specified stock opname
     */
    public function show(StokOpname $stokOpname): JsonResponse
    {
        $stokOpname->load(['details.batch.obat', 'penanggungJawab', 'approvedBy', 'unit']);
        
        return response()->json($stokOpname);
    }

    /**
     * Complete stock opname
     */
    public function complete(Request $request, StokOpname $stokOpname): JsonResponse
    {
        if ($stokOpname->status !== StokOpname::STATUS_IN_PROGRESS) {
            return response()->json(['message' => 'Stok opname sudah diselesaikan'], 400);
        }

        $request->validate([
            'berita_acara' => 'required|string',
        ]);

        $stokOpname->update([
            'status' => StokOpname::STATUS_COMPLETED,
            'berita_acara' => $request->berita_acara,
        ]);

        LogAktivitas::log(
            auth()->user(),
            "Menyelesaikan stok opname: {$stokOpname->nomor_opname}",
            'stok_opname',
            LogAktivitas::AKSI_UPDATE,
            $stokOpname
        );

        return response()->json([
            'message' => 'Stok opname selesai, menunggu approval',
            'opname' => $stokOpname,
        ]);
    }

    /**
     * Approve stock opname
     */
    public function approve(Request $request, StokOpname $stokOpname): JsonResponse
    {
        if ($stokOpname->status !== StokOpname::STATUS_COMPLETED) {
            return response()->json(['message' => 'Stok opname belum selesai'], 400);
        }

        $stokOpname->approve(auth()->user());

        LogAktivitas::log(
            auth()->user(),
            "Menyetujui stok opname: {$stokOpname->nomor_opname}",
            'stok_opname',
            LogAktivitas::AKSI_UPDATE,
            $stokOpname
        );

        return response()->json([
            'message' => 'Stok opname disetujui dan stok telah disesuaikan',
            'opname' => $stokOpname->load(['details.batch.obat']),
        ]);
    }

    /**
     * Get pending approval stock opname
     */
    public function pendingApproval(Request $request): JsonResponse
    {
        $opname = StokOpname::with(['penanggungJawab', 'unit'])
            ->pendingApproval()
            ->latest('tanggal_opname')
            ->get();

        return response()->json($opname);
    }
}
