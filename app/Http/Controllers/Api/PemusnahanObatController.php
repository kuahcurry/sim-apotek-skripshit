<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\PemusnahanObat;
use App\Models\PemusnahanObatDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PemusnahanObatController extends Controller
{
    /**
     * Display a listing of drug destructions
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');

        $query = PemusnahanObat::with(['penanggungJawab', 'approvedBy'])
            ->latest('tanggal_pemusnahan');

        if ($status) {
            $query->where('status', $status);
        }

        $pemusnahan = $query->paginate($perPage);

        return response()->json($pemusnahan);
    }

    /**
     * Store a newly created drug destruction
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tanggal_pemusnahan' => 'required|date',
            'penanggung_jawab' => 'required|exists:users,id',
            'lokasi_pemusnahan' => 'nullable|string',
            'metode_pemusnahan' => 'nullable|string',
            'saksi' => 'nullable|array',
            'saksi.*' => 'string',
            'alasan' => 'required|in:expired,rusak,recall,lainnya',
            'keterangan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.batch_id' => 'required|exists:batch_obat,id',
            'details.*.jumlah' => 'required|integer|min:1',
            'details.*.kondisi' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            // Create destruction record
            $pemusnahan = PemusnahanObat::create([
                'tanggal_pemusnahan' => $request->tanggal_pemusnahan,
                'penanggung_jawab' => $request->penanggung_jawab,
                'lokasi_pemusnahan' => $request->lokasi_pemusnahan,
                'metode_pemusnahan' => $request->metode_pemusnahan,
                'saksi' => $request->saksi,
                'alasan' => $request->alasan,
                'keterangan' => $request->keterangan,
                'status' => PemusnahanObat::STATUS_DRAFT,
            ]);

            // Create details
            foreach ($request->details as $detailData) {
                $batch = \App\Models\BatchObat::find($detailData['batch_id']);
                
                // Calculate nilai perolehan
                $nilaiPerolehan = $batch->harga_beli * $detailData['jumlah'];

                PemusnahanObatDetail::create([
                    'pemusnahan_id' => $pemusnahan->id,
                    'batch_id' => $detailData['batch_id'],
                    'jumlah' => $detailData['jumlah'],
                    'nilai_perolehan' => $nilaiPerolehan,
                    'kondisi' => $detailData['kondisi'] ?? null,
                ]);
            }

            LogAktivitas::log(
                auth()->user(),
                "Membuat dokumen pemusnahan obat: {$pemusnahan->nomor_berita_acara}",
                'pemusnahan_obat',
                LogAktivitas::AKSI_CREATE,
                $pemusnahan
            );

            return response()->json($pemusnahan->load(['details.batch.obat', 'penanggungJawab']), 201);
        });
    }

    /**
     * Display the specified drug destruction
     */
    public function show(PemusnahanObat $pemusnahanObat): JsonResponse
    {
        $pemusnahanObat->load(['details.batch.obat', 'penanggungJawab', 'approvedBy']);
        
        return response()->json($pemusnahanObat);
    }

    /**
     * Upload berita acara file
     */
    public function uploadBeritaAcara(Request $request, PemusnahanObat $pemusnahanObat): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:5120', // max 5MB
        ]);

        if ($pemusnahanObat->file_berita_acara) {
            Storage::delete($pemusnahanObat->file_berita_acara);
        }

        $path = $request->file('file')->store('berita-acara', 'public');

        $pemusnahanObat->update([
            'file_berita_acara' => $path,
            'status' => PemusnahanObat::STATUS_COMPLETED,
        ]);

        return response()->json([
            'message' => 'Berita acara berhasil diupload',
            'file_path' => $path,
        ]);
    }

    /**
     * Approve drug destruction
     */
    public function approve(Request $request, PemusnahanObat $pemusnahanObat): JsonResponse
    {
        if ($pemusnahanObat->status !== PemusnahanObat::STATUS_COMPLETED) {
            return response()->json(['message' => 'Pemusnahan belum selesai atau berita acara belum diupload'], 400);
        }

        $pemusnahanObat->approve(auth()->user());

        LogAktivitas::log(
            auth()->user(),
            "Menyetujui pemusnahan obat: {$pemusnahanObat->nomor_berita_acara}",
            'pemusnahan_obat',
            LogAktivitas::AKSI_UPDATE,
            $pemusnahanObat
        );

        return response()->json([
            'message' => 'Pemusnahan obat disetujui dan stok telah disesuaikan',
            'total_nilai' => $pemusnahanObat->total_nilai,
            'pemusnahan' => $pemusnahanObat->load(['details.batch.obat']),
        ]);
    }

    /**
     * Get pending approval destructions
     */
    public function pendingApproval(Request $request): JsonResponse
    {
        $pemusnahan = PemusnahanObat::with(['penanggungJawab'])
            ->pendingApproval()
            ->latest('tanggal_pemusnahan')
            ->get();

        return response()->json($pemusnahan);
    }

    /**
     * Get expired medicines eligible for destruction
     */
    public function eligibleForDestruction(Request $request): JsonResponse
    {
        $batches = \App\Models\BatchObat::with(['obat'])
            ->where(function($q) {
                $q->where('status', 'expired')
                  ->orWhere('tanggal_expired', '<', now());
            })
            ->where('stok_tersedia', '>', 0)
            ->get();

        return response()->json($batches);
    }
}
