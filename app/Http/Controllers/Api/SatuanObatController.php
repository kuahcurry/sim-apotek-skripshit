<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SatuanObat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SatuanObatController extends Controller
{
    /**
     * Display a listing of satuan obat.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SatuanObat::withCount('obat');

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
        $satuans = $query->paginate($perPage);

        return response()->json($satuans);
    }

    /**
     * Get all active satuan for dropdown.
     */
    public function active(): JsonResponse
    {
        $satuans = SatuanObat::where('is_active', true)
            ->orderBy('nama')
            ->get(['id', 'kode', 'nama']);

        return response()->json($satuans);
    }

    /**
     * Store a newly created satuan.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:satuan_obat,kode',
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

        $satuan = SatuanObat::create($validator->validated());

        return response()->json([
            'message' => 'Satuan obat berhasil ditambahkan',
            'data' => $satuan,
        ], 201);
    }

    /**
     * Display the specified satuan.
     */
    public function show(SatuanObat $satuanObat): JsonResponse
    {
        $satuanObat->loadCount('obat');

        return response()->json($satuanObat);
    }

    /**
     * Update the specified satuan.
     */
    public function update(Request $request, SatuanObat $satuanObat): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:satuan_obat,kode,' . $satuanObat->id,
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

        $satuanObat->update($validator->validated());

        return response()->json([
            'message' => 'Satuan obat berhasil diperbarui',
            'data' => $satuanObat,
        ]);
    }

    /**
     * Remove the specified satuan.
     */
    public function destroy(SatuanObat $satuanObat): JsonResponse
    {
        // Check if satuan has obat
        if ($satuanObat->obat()->count() > 0) {
            return response()->json([
                'message' => 'Satuan tidak dapat dihapus karena masih memiliki obat',
            ], 422);
        }

        $satuanObat->delete();

        return response()->json([
            'message' => 'Satuan obat berhasil dihapus',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(SatuanObat $satuanObat): JsonResponse
    {
        $satuanObat->update([
            'is_active' => !$satuanObat->is_active,
        ]);

        return response()->json([
            'message' => 'Status satuan berhasil diubah',
            'data' => $satuanObat,
        ]);
    }
}
