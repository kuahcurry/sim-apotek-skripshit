<?php

namespace App\Http\Controllers;

use App\Models\KategoriObat;
use App\Models\JenisObat;
use App\Models\SatuanObat;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KategoriObatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('masterdata/index', [
            'kategori' => KategoriObat::latest()->get(),
            'jenis' => JenisObat::latest()->get(),
            'satuan' => SatuanObat::latest()->get(),
            'supplier' => Supplier::latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:100|unique:kategori_obat,nama_kategori',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        KategoriObat::create($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Kategori obat berhasil ditambahkan');
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
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $kategori = KategoriObat::findOrFail($id);

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:100|unique:kategori_obat,nama_kategori,' . $id,
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $kategori->update($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Kategori obat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kategori = KategoriObat::findOrFail($id);
        $kategori->delete();

        return redirect()->route('masterdata.index')
            ->with('success', 'Kategori obat berhasil dihapus');
    }
}
