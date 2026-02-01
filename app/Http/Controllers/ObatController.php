<?php

namespace App\Http\Controllers;

use App\Models\Obat;
use App\Models\KategoriObat;
use App\Models\JenisObat;
use App\Models\SatuanObat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ObatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $obats = Obat::with(['kategori', 'jenis', 'satuan'])
            ->when($request->search, function ($query, $search) {
                $query->where('nama_obat', 'like', "%{$search}%")
                    ->orWhere('kode_obat', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('obat/data-obat', [
            'obats' => $obats,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('obat/create', [
            'kategori' => KategoriObat::where('is_active', true)->get(),
            'jenis' => JenisObat::where('is_active', true)->get(),
            'satuan' => SatuanObat::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kode_obat' => 'required|string|max:50|unique:obat,kode_obat',
            'nama_obat' => 'required|string|max:191',
            'nama_generik' => 'nullable|string|max:191',
            'nama_brand' => 'nullable|string|max:191',
            'kategori_id' => 'required|exists:kategori_obat,id',
            'jenis_id' => 'required|exists:jenis_obat,id',
            'satuan_id' => 'required|exists:satuan_obat,id',
            'stok_minimum' => 'required|integer|min:0',
            'harga_beli' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
            'lokasi_penyimpanan' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'efek_samping' => 'nullable|string',
            'indikasi' => 'nullable|string',
            'kontraindikasi' => 'nullable|string',
        ]);

        // Set default values
        $validated['stok_total'] = 0;
        $validated['is_active'] = true;

        Obat::create($validated);

        return redirect()->route('obat.index')
            ->with('success', 'Obat berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $obat = Obat::findOrFail($id);

        return Inertia::render('obat/edit', [
            'obat' => $obat,
            'kategori' => KategoriObat::where('is_active', true)->get(),
            'jenis' => JenisObat::where('is_active', true)->get(),
            'satuan' => SatuanObat::where('is_active', true)->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $obat = Obat::findOrFail($id);

        $validated = $request->validate([
            'kode_obat' => 'required|string|max:50|unique:obat,kode_obat,' . $id,
            'nama_obat' => 'required|string|max:191',
            'nama_generik' => 'nullable|string|max:191',
            'nama_brand' => 'nullable|string|max:191',
            'kategori_id' => 'required|exists:kategori_obat,id',
            'jenis_id' => 'required|exists:jenis_obat,id',
            'satuan_id' => 'required|exists:satuan_obat,id',
            'stok_minimum' => 'required|integer|min:0',
            'harga_beli' => 'nullable|numeric|min:0',
            'harga_jual' => 'nullable|numeric|min:0',
            'lokasi_penyimpanan' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'efek_samping' => 'nullable|string',
            'indikasi' => 'nullable|string',
            'kontraindikasi' => 'nullable|string',
        ]);

        $obat->update($validated);

        return redirect()->route('obat.index')
            ->with('success', 'Obat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $obat = Obat::findOrFail($id);
        $obat->delete();

        return redirect()->route('obat.index')
            ->with('success', 'Obat berhasil dihapus');
    }
}
