<?php

namespace App\Http\Controllers;

use App\Models\JenisObat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JenisObatController extends Controller
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
            'nama_jenis' => 'required|string|max:100|unique:jenis_obat,nama_jenis',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        JenisObat::create($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Jenis obat berhasil ditambahkan');
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
        $jenis = JenisObat::findOrFail($id);

        $validated = $request->validate([
            'nama_jenis' => 'required|string|max:100|unique:jenis_obat,nama_jenis,' . $id,
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $jenis->update($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Jenis obat berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $jenis = JenisObat::findOrFail($id);
        $jenis->delete();

        return redirect()->route('masterdata.index')
            ->with('success', 'Jenis obat berhasil dihapus');
    }
}
