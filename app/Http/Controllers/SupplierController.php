<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
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
            'kode_supplier' => 'required|string|max:20|unique:supplier,kode_supplier',
            'nama_supplier' => 'required|string|max:200',
            'alamat' => 'nullable|string',
            'no_telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'kontak_person' => 'nullable|string|max:100',
            'no_hp_kontak' => 'nullable|string|max:20',
            'npwp' => 'nullable|string|max:30',
            'status' => 'in:active,inactive',
            'catatan' => 'nullable|string',
        ]);

        $validated['status'] = $validated['status'] ?? 'active';

        Supplier::create($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Supplier berhasil ditambahkan');
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
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'kode_supplier' => 'required|string|max:20|unique:supplier,kode_supplier,' . $id,
            'nama_supplier' => 'required|string|max:200',
            'alamat' => 'nullable|string',
            'no_telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'kontak_person' => 'nullable|string|max:100',
            'no_hp_kontak' => 'nullable|string|max:20',
            'npwp' => 'nullable|string|max:30',
            'status' => 'in:active,inactive',
            'catatan' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->route('masterdata.index')
            ->with('success', 'Supplier berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return redirect()->route('masterdata.index')
            ->with('success', 'Supplier berhasil dihapus');
    }
}
