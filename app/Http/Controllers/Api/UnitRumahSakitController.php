<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UnitRumahSakit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnitRumahSakitController extends Controller
{
    /**
     * Display a listing of unit rumah sakit.
     */
    public function index(Request $request): JsonResponse
    {
        $query = UnitRumahSakit::withCount('permintaan');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%")
                  ->orWhere('penanggung_jawab', 'like', "%{$search}%");
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
        $units = $query->paginate($perPage);

        return response()->json($units);
    }

    /**
     * Get all active units for dropdown.
     */
    public function active(): JsonResponse
    {
        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama')
            ->get(['id', 'kode', 'nama', 'lokasi']);

        return response()->json($units);
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:unit_rumah_sakit,kode',
            'nama' => 'required|string|max:100',
            'lokasi' => 'nullable|string|max:200',
            'penanggung_jawab' => 'nullable|string|max:100',
            'no_telepon' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $unit = UnitRumahSakit::create($validator->validated());

        return response()->json([
            'message' => 'Unit rumah sakit berhasil ditambahkan',
            'data' => $unit,
        ], 201);
    }

    /**
     * Display the specified unit.
     */
    public function show(UnitRumahSakit $unitRumahSakit): JsonResponse
    {
        $unitRumahSakit->loadCount('permintaan');
        $unitRumahSakit->load([
            'permintaan' => function ($query) {
                $query->latest()->limit(10);
            },
        ]);

        return response()->json($unitRumahSakit);
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, UnitRumahSakit $unitRumahSakit): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:10|unique:unit_rumah_sakit,kode,' . $unitRumahSakit->id,
            'nama' => 'required|string|max:100',
            'lokasi' => 'nullable|string|max:200',
            'penanggung_jawab' => 'nullable|string|max:100',
            'no_telepon' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $unitRumahSakit->update($validator->validated());

        return response()->json([
            'message' => 'Unit rumah sakit berhasil diperbarui',
            'data' => $unitRumahSakit,
        ]);
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(UnitRumahSakit $unitRumahSakit): JsonResponse
    {
        // Check if unit has permintaan
        if ($unitRumahSakit->permintaan()->count() > 0) {
            return response()->json([
                'message' => 'Unit tidak dapat dihapus karena memiliki riwayat permintaan',
            ], 422);
        }

        $unitRumahSakit->delete();

        return response()->json([
            'message' => 'Unit rumah sakit berhasil dihapus',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(UnitRumahSakit $unitRumahSakit): JsonResponse
    {
        $unitRumahSakit->update([
            'is_active' => !$unitRumahSakit->is_active,
        ]);

        return response()->json([
            'message' => 'Status unit berhasil diubah',
            'data' => $unitRumahSakit,
        ]);
    }

    /**
     * Get unit statistics.
     */
    public function statistics(UnitRumahSakit $unitRumahSakit): JsonResponse
    {
        $stats = [
            'total_permintaan' => $unitRumahSakit->permintaan()->count(),
            'permintaan_pending' => $unitRumahSakit->permintaan()
                ->where('status', 'pending')
                ->count(),
            'permintaan_processed' => $unitRumahSakit->permintaan()
                ->where('status', 'processed')
                ->count(),
            'permintaan_completed' => $unitRumahSakit->permintaan()
                ->where('status', 'completed')
                ->count(),
            'permintaan_rejected' => $unitRumahSakit->permintaan()
                ->where('status', 'rejected')
                ->count(),
        ];

        return response()->json($stats);
    }
}
