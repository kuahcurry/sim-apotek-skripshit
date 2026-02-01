<?php

namespace App\Http\Controllers;

use App\Models\SatuanObat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SatuanObatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('masterdata/index');
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
            'nama_satuan' => 'required|string|max:50|unique:satuan_obat,nama_satuan',
            'singkatan' => 'required|string|max:10',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        SatuanObat::create($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Satuan obat berhasil ditambahkan');
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
        $satuan = SatuanObat::findOrFail($id);

        $validated = $request->validate([
            'nama_satuan' => 'required|string|max:50|unique:satuan_obat,nama_satuan,' . $id,
            'singkatan' => 'required|string|max:10',
            'is_active' => 'boolean',
        ]);

        $satuan->update($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Satuan obat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $satuan = SatuanObat::findOrFail($id);
        $satuan->delete();

        return redirect()->route('masterdata.index')
            ->with('success', 'Satuan obat berhasil dihapus');
    }
}
