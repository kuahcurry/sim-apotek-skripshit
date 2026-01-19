<?php

namespace App\Http\Controllers\Api;

use App\Events\PermintaanCreated;
use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\Notifikasi;
use App\Models\Resep;
use App\Models\ResepDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ResepController extends Controller
{
    /**
     * Display a listing of prescriptions
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        $search = $request->get('search');

        $query = Resep::with(['unit', 'processedBy', 'details.obat'])
            ->latest('tanggal_resep');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_resep', 'like', "%{$search}%")
                    ->orWhere('nomor_rm', 'like', "%{$search}%")
                    ->orWhere('nama_pasien', 'like', "%{$search}%");
            });
        }

        $resep = $query->paginate($perPage);

        return response()->json($resep);
    }

    /**
     * Store a newly created prescription
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nomor_rm' => 'required|string|max:50',
            'nama_pasien' => 'required|string|max:200',
            'nama_dokter' => 'required|string|max:200',
            'unit_id' => 'nullable|exists:unit_rumah_sakit,id',
            'tanggal_resep' => 'required|date',
            'jenis_pasien' => 'required|in:rawat_jalan,rawat_inap,igd',
            'cara_bayar' => 'required|in:umum,bpjs,asuransi',
            'catatan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.obat_id' => 'required|exists:obat,id',
            'details.*.jumlah' => 'required|integer|min:1',
            'details.*.dosis' => 'nullable|string',
            'details.*.aturan_pakai' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            // Create prescription
            $resep = Resep::create([
                'nomor_rm' => $request->nomor_rm,
                'nama_pasien' => $request->nama_pasien,
                'nama_dokter' => $request->nama_dokter,
                'unit_id' => $request->unit_id,
                'tanggal_resep' => $request->tanggal_resep,
                'jenis_pasien' => $request->jenis_pasien,
                'cara_bayar' => $request->cara_bayar,
                'catatan' => $request->catatan,
                'status' => Resep::STATUS_PENDING,
            ]);

            // Create prescription details
            foreach ($request->details as $detailData) {
                ResepDetail::create([
                    'resep_id' => $resep->id,
                    'obat_id' => $detailData['obat_id'],
                    'jumlah' => $detailData['jumlah'],
                    'dosis' => $detailData['dosis'] ?? null,
                    'aturan_pakai' => $detailData['aturan_pakai'] ?? null,
                    'catatan' => $detailData['catatan'] ?? null,
                ]);
            }

            LogAktivitas::log(
                auth()->user(),
                "Membuat resep baru: {$resep->nomor_resep} untuk pasien {$resep->nama_pasien}",
                'resep',
                LogAktivitas::AKSI_CREATE,
                $resep
            );

            return response()->json($resep->load(['details.obat', 'unit']), 201);
        });
    }

    /**
     * Display the specified prescription
     */
    public function show(Resep $resep): JsonResponse
    {
        $resep->load(['details.obat', 'unit', 'processedBy', 'transaksi']);
        
        return response()->json($resep);
    }

    /**
     * Get pending prescriptions
     */
    public function pending(Request $request): JsonResponse
    {
        $resep = Resep::with(['details.obat', 'unit'])
            ->pending()
            ->latest('tanggal_resep')
            ->get();

        return response()->json($resep);
    }

    /**
     * Process prescription (dispense medicines)
     */
    public function process(Request $request, Resep $resep): JsonResponse
    {
        if (!$resep->isPending()) {
            return response()->json(['message' => 'Resep sudah diproses'], 400);
        }

        // Check stock availability
        foreach ($resep->details as $detail) {
            if ($detail->obat->stok_total < $detail->jumlah) {
                return response()->json([
                    'message' => "Stok tidak mencukupi untuk {$detail->obat->nama_obat}",
                    'available' => $detail->obat->stok_total,
                    'required' => $detail->jumlah,
                ], 400);
            }
        }

        $resep->update([
            'status' => Resep::STATUS_PROCESSED,
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        LogAktivitas::log(
            auth()->user(),
            "Memproses resep: {$resep->nomor_resep}",
            'resep',
            LogAktivitas::AKSI_UPDATE,
            $resep
        );

        return response()->json([
            'message' => 'Resep siap untuk dispensing',
            'resep' => $resep->load(['details.obat']),
        ]);
    }

    /**
     * Mark prescription as completed
     */
    public function complete(Request $request, Resep $resep): JsonResponse
    {
        $resep->update(['status' => Resep::STATUS_COMPLETED]);

        // Mark all details as dispensed
        $resep->details()->update(['is_dispensed' => true]);

        LogAktivitas::log(
            auth()->user(),
            "Menyelesaikan resep: {$resep->nomor_resep}",
            'resep',
            LogAktivitas::AKSI_UPDATE,
            $resep
        );

        return response()->json([
            'message' => 'Resep selesai',
            'resep' => $resep,
        ]);
    }
}
