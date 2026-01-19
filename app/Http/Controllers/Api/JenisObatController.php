<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JenisObat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JenisObatController extends Controller
{
    /**
     * Display a listing of jenis obat.
     */
    public function index(Request $request): JsonResponse
    {
        $query = JenisObat::withCount('obat');

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
        $jenis = $query->paginate($perPage);

        return response()->json($jenis);
    }

    /**
     * Get all active jenis for dropdown.
     */
    public function active(): JsonResponse
    {
        $jenis = JenisObat::where('is_active', true)
            ->orderBy('nama')
            ->get(['id', 'kode', 'nama']);

        return response()->json($jenis);
    }

    /**
     * Store a newly created jenis.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:jenis_obat,kode',
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

        $jenis = JenisObat::create($validator->validated());

        return response()->json([
            'message' => 'Jenis obat berhasil ditambahkan',
            'data' => $jenis,
        ], 201);
    }

    /**
     * Display the specified jenis.
     */
    public function show(JenisObat $jenisObat): JsonResponse
    {
        $jenisObat->loadCount('obat');

        return response()->json($jenisObat);
    }

    /**
     * Update the specified jenis.
     */
    public function update(Request $request, JenisObat $jenisObat): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:jenis_obat,kode,' . $jenisObat->id,
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

        $jenisObat->update($validator->validated());

        return response()->json([
            'message' => 'Jenis obat berhasil diperbarui',
            'data' => $jenisObat,
        ]);
    }

    /**
     * Remove the specified jenis.
     */
    public function destroy(JenisObat $jenisObat): JsonResponse
    {
        // Check if jenis has obat
        if ($jenisObat->obat()->count() > 0) {
            return response()->json([
                'message' => 'Jenis tidak dapat dihapus karena masih memiliki obat',
            ], 422);
        }

        $jenisObat->delete();

        return response()->json([
            'message' => 'Jenis obat berhasil dihapus',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(JenisObat $jenisObat): JsonResponse
    {
        $jenisObat->update([
            'is_active' => !$jenisObat->is_active,
        ]);

        return response()->json([
            'message' => 'Status jenis berhasil diubah',
            'data' => $jenisObat,
        ]);
    }
}
