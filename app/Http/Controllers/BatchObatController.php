<?php

namespace App\Http\Controllers;

use App\Models\BatchObat;
use App\Models\Obat;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BatchObatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $batches = BatchObat::with(['obat.kategori', 'obat.jenis', 'obat.satuan', 'supplier'])
            ->orderBy('tanggal_expired', 'asc')
            ->paginate(20);

        return Inertia::render('obat/batch/index', [
            'batches' => $batches,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $obat = Obat::with(['kategori', 'jenis', 'satuan'])
            ->where('is_active', true)
            ->orderBy('nama_obat')
            ->get();

        $suppliers = Supplier::where('status', 'active')
            ->orderBy('nama_supplier')
            ->get();

        return Inertia::render('obat/batch/create', [
            'obat' => $obat,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id',
            'supplier_id' => 'nullable|exists:supplier,id',
            'nomor_batch' => 'required|string|max:50',
            'tanggal_produksi' => 'nullable|date',
            'tanggal_expired' => 'required|date|after:today',
            'tanggal_masuk' => 'required|date',
            'stok_awal' => 'required|integer|min:1',
            'harga_beli' => 'required|numeric|min:0',
            'status' => 'nullable|in:active,expired,empty,recalled',
            'catatan' => 'nullable|string',
        ]);

        // Set stok_tersedia = stok_awal for new batch
        $validated['stok_tersedia'] = $validated['stok_awal'];
        $validated['status'] = $validated['status'] ?? 'active';

        $batch = BatchObat::create($validated);

        // Update total stock of the medicine
        $obat = Obat::find($validated['obat_id']);
        $obat->stok_total = BatchObat::where('obat_id', $obat->id)
            ->where('status', 'active')
            ->sum('stok_tersedia');
        $obat->save();

        return redirect()->route('batch.index')
            ->with('success', 'Batch obat berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $batch = BatchObat::with(['obat.kategori', 'obat.jenis', 'obat.satuan', 'supplier', 'transaksi'])
            ->findOrFail($id);

        return Inertia::render('obat/batch/show', [
            'batch' => $batch,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $batch = BatchObat::with(['obat'])->findOrFail($id);

        $obat = Obat::with(['kategori', 'jenis', 'satuan'])
            ->where('is_active', true)
            ->orderBy('nama_obat')
            ->get();

        $suppliers = Supplier::where('status', 'active')
            ->orderBy('nama_supplier')
            ->get();

        return Inertia::render('obat/batch/edit', [
            'batch' => $batch,
            'obat' => $obat,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $batch = BatchObat::findOrFail($id);

        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id',
            'supplier_id' => 'nullable|exists:supplier,id',
            'nomor_batch' => 'required|string|max:50',
            'tanggal_produksi' => 'nullable|date',
            'tanggal_expired' => 'required|date',
            'tanggal_masuk' => 'required|date',
            'stok_awal' => 'required|integer|min:0',
            'harga_beli' => 'required|numeric|min:0',
            'status' => 'in:active,expired,empty,recalled',
            'catatan' => 'nullable|string',
        ]);

        $batch->update($validated);

        // Recalculate medicine total stock
        $obat = Obat::find($batch->obat_id);
        $obat->stok_total = BatchObat::where('obat_id', $obat->id)
            ->where('status', 'active')
            ->sum('stok_tersedia');
        $obat->save();

        return redirect()->route('batch.index')
            ->with('success', 'Batch obat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $batch = BatchObat::findOrFail($id);
        $obat_id = $batch->obat_id;
        
        $batch->delete();

        // Recalculate medicine total stock
        $obat = Obat::find($obat_id);
        $obat->stok_total = BatchObat::where('obat_id', $obat->id)
            ->where('status', 'active')
            ->sum('stok_tersedia');
        $obat->save();

        return redirect()->route('batch.index')
            ->with('success', 'Batch obat berhasil dihapus');
    }
}
