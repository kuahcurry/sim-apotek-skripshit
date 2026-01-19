<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriObat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KategoriObatController extends Controller
{
    /**
     * Display a listing of kategori obat.
     */
    public function index(Request $request): JsonResponse
    {
        $query = KategoriObat::withCount('obat');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'nama');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $kategoris = $query->paginate($perPage);

        return response()->json($kategoris);
    }

    /**
     * Get all active kategori for dropdown.
     */
    public function active(): JsonResponse
    {
        $kategoris = KategoriObat::where('is_active', true)
            ->orderBy('nama')
            ->get(['id', 'kode', 'nama']);

        return response()->json($kategoris);
    }

    /**
     * Store a newly created kategori.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:kategori_obat,kode',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kategori = KategoriObat::create($validator->validated());

        return response()->json([
            'message' => 'Kategori obat berhasil ditambahkan',
            'data' => $kategori,
        ], 201);
    }

    /**
     * Display the specified kategori.
     */
    public function show(KategoriObat $kategoriObat): JsonResponse
    {
        $kategoriObat->loadCount('obat');

        return response()->json($kategoriObat);
    }

    /**
     * Update the specified kategori.
     */
    public function update(Request $request, KategoriObat $kategoriObat): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:kategori_obat,kode,' . $kategoriObat->id,
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kategoriObat->update($validator->validated());

        return response()->json([
            'message' => 'Kategori obat berhasil diperbarui',
            'data' => $kategoriObat,
        ]);
    }

    /**
     * Remove the specified kategori.
     */
    public function destroy(KategoriObat $kategoriObat): JsonResponse
    {
        // Check if kategori has obat
        if ($kategoriObat->obat()->count() > 0) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih memiliki obat',
            ], 422);
        }

        $kategoriObat->delete();

        return response()->json([
            'message' => 'Kategori obat berhasil dihapus',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(KategoriObat $kategoriObat): JsonResponse
    {
        $kategoriObat->update([
            'is_active' => !$kategoriObat->is_active,
        ]);

        return response()->json([
            'message' => 'Status kategori berhasil diubah',
            'data' => $kategoriObat,
        ]);
    }
}
