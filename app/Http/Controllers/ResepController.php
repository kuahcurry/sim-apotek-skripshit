<?php

namespace App\Http\Controllers;

use App\Models\Resep;
use App\Models\Obat;
use App\Models\UnitRumahSakit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResepController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $resep = Resep::with(['unit', 'processedBy', 'details.obat'])
            ->latest()
            ->paginate(20);

        return Inertia::render('obat/resep/index', [
            'resep' => $resep,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $obat = Obat::with(['kategori', 'jenis', 'satuan'])
            ->where('stok_total', '>', 0)
            ->orderBy('nama_obat')
            ->get();

        $units = UnitRumahSakit::orderBy('nama_unit')->get();

        return Inertia::render('obat/resep/create', [
            'obat' => $obat,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
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
            'details.*.dosis' => 'nullable|string|max:100',
            'details.*.aturan_pakai' => 'nullable|string|max:200',
            'details.*.catatan' => 'nullable|string',
        ]);

        $resep = Resep::create($validated);

        // Create details
        foreach ($validated['details'] as $detail) {
            $resep->details()->create($detail);
        }

        return redirect()->route('resep.index')
            ->with('success', 'Resep berhasil dibuat');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $resep = Resep::with(['unit', 'processedBy', 'details.obat.satuan'])
            ->findOrFail($id);

        return Inertia::render('obat/resep/show', [
            'resep' => $resep,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $resep = Resep::with(['details'])->findOrFail($id);

        // Only allow editing pending prescriptions
        if ($resep->status !== 'pending') {
            return redirect()->route('resep.show', $id)
                ->with('error', 'Hanya resep dengan status pending yang dapat diedit');
        }

        $obat = Obat::with(['kategori', 'jenis', 'satuan'])
            ->where('stok_total', '>', 0)
            ->orderBy('nama_obat')
            ->get();

        $units = UnitRumahSakit::orderBy('nama_unit')->get();

        return Inertia::render('obat/resep/edit', [
            'resep' => $resep,
            'obat' => $obat,
            'units' => $units,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $resep = Resep::findOrFail($id);

        // Only allow updating pending prescriptions
        if ($resep->status !== 'pending') {
            return redirect()->route('resep.show', $id)
                ->with('error', 'Hanya resep dengan status pending yang dapat diupdate');
        }

        $validated = $request->validate([
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
            'details.*.dosis' => 'nullable|string|max:100',
            'details.*.aturan_pakai' => 'nullable|string|max:200',
            'details.*.catatan' => 'nullable|string',
        ]);

        $resep->update($validated);

        // Delete old details and create new ones
        $resep->details()->delete();
        foreach ($validated['details'] as $detail) {
            $resep->details()->create($detail);
        }

        return redirect()->route('resep.index')
            ->with('success', 'Resep berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $resep = Resep::findOrFail($id);

        // Only allow deleting pending prescriptions
        if ($resep->status !== 'pending') {
            return redirect()->route('resep.index')
                ->with('error', 'Hanya resep dengan status pending yang dapat dihapus');
        }

        $resep->delete();

        return redirect()->route('resep.index')
            ->with('success', 'Resep berhasil dihapus');
    }
}
