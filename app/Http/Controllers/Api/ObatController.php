<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\Obat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ObatController extends Controller
{
    /**
     * Display a listing of medicines
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $kategori = $request->get('kategori');
        $jenis = $request->get('jenis');

        $query = Obat::with(['kategori', 'jenis', 'satuan', 'batches'])
            ->active();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_obat', 'like', "%{$search}%")
                    ->orWhere('nama_generik', 'like', "%{$search}%")
                    ->orWhere('kode_obat', 'like', "%{$search}%");
            });
        }

        if ($kategori) {
            $query->where('kategori_id', $kategori);
        }

        if ($jenis) {
            $query->where('jenis_id', $jenis);
        }

        $obats = $query->orderBy('nama_obat')->paginate($perPage);

        return response()->json($obats);
    }

    /**
     * Store a newly created medicine
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode_obat' => 'required|unique:obat,kode_obat',
            'nama_obat' => 'required|max:200',
            'nama_generik' => 'nullable|max:200',
            'nama_brand' => 'nullable|max:200',
            'kategori_id' => 'required|exists:kategori_obat,id',
            'jenis_id' => 'required|exists:jenis_obat,id',
            'satuan_id' => 'required|exists:satuan_obat,id',
            'stok_minimum' => 'required|integer|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'lokasi_penyimpanan' => 'nullable|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $obat = Obat::create($request->all());

        LogAktivitas::log(
            auth()->user(),
            "Menambah obat baru: {$obat->nama_obat}",
            'obat',
            LogAktivitas::AKSI_CREATE,
            $obat,
            null,
            $obat->toArray()
        );

        return response()->json($obat->load(['kategori', 'jenis', 'satuan']), 201);
    }

    /**
     * Display the specified medicine
     */
    public function show(Obat $obat): JsonResponse
    {
        $obat->load(['kategori', 'jenis', 'satuan', 'batches.obat', 'transaksi']);
        
        return response()->json($obat);
    }

    /**
     * Update the specified medicine
     */
    public function update(Request $request, Obat $obat): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode_obat' => 'required|unique:obat,kode_obat,' . $obat->id,
            'nama_obat' => 'required|max:200',
            'nama_generik' => 'nullable|max:200',
            'nama_brand' => 'nullable|max:200',
            'kategori_id' => 'required|exists:kategori_obat,id',
            'jenis_id' => 'required|exists:jenis_obat,id',
            'satuan_id' => 'required|exists:satuan_obat,id',
            'stok_minimum' => 'required|integer|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'lokasi_penyimpanan' => 'nullable|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldData = $obat->toArray();
        $obat->update($request->all());

        LogAktivitas::log(
            auth()->user(),
            "Mengubah data obat: {$obat->nama_obat}",
            'obat',
            LogAktivitas::AKSI_UPDATE,
            $obat,
            $oldData,
            $obat->toArray()
        );

        return response()->json($obat->load(['kategori', 'jenis', 'satuan']));
    }

    /**
     * Remove the specified medicine
     */
    public function destroy(Obat $obat): JsonResponse
    {
        LogAktivitas::log(
            auth()->user(),
            "Menghapus obat: {$obat->nama_obat}",
            'obat',
            LogAktivitas::AKSI_DELETE,
            $obat,
            $obat->toArray(),
            null
        );

        $obat->delete();

        return response()->json(['message' => 'Obat berhasil dihapus']);
    }

    /**
     * Get low stock medicines
     */
    public function lowStock(Request $request): JsonResponse
    {
        $obats = Obat::with(['kategori', 'jenis', 'satuan'])
            ->active()
            ->stokRendah()
            ->orderByRaw('(stok_total - stok_minimum)')
            ->get();

        return response()->json($obats);
    }

    /**
     * Search medicines
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');
        
        $obats = Obat::with(['kategori', 'jenis', 'satuan'])
            ->active()
            ->where(function ($q) use ($query) {
                $q->where('nama_obat', 'like', "%{$query}%")
                    ->orWhere('nama_generik', 'like', "%{$query}%")
                    ->orWhere('kode_obat', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get();

        return response()->json($obats);
    }

    /**
     * Get batches for a medicine
     */
    public function batches(Obat $obat): JsonResponse
    {
        $batches = $obat->batches()
            ->active()
            ->fefo()
            ->get();

        return response()->json($batches);
    }

    /**
     * Recalculate stock for a medicine
     */
    public function recalculateStock(Obat $obat): JsonResponse
    {
        $oldStok = $obat->stok_total;
        $obat->recalculateStok();

        LogAktivitas::log(
            auth()->user(),
            "Recalculate stok obat: {$obat->nama_obat}",
            'obat',
            LogAktivitas::AKSI_UPDATE,
            $obat,
            ['stok_total' => $oldStok],
            ['stok_total' => $obat->stok_total]
        );

        return response()->json([
            'message' => 'Stok berhasil direcalculate',
            'old_stok' => $oldStok,
            'new_stok' => $obat->stok_total,
        ]);
    }
}
