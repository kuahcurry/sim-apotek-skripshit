<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::withCount('batches');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%")
                  ->orWhere('kontak_person', 'like', "%{$search}%")
                  ->orWhere('no_telepon', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
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
        $suppliers = $query->paginate($perPage);

        return response()->json($suppliers);
    }

    /**
     * Get all active suppliers for dropdown.
     */
    public function active(): JsonResponse
    {
        $suppliers = Supplier::where('is_active', true)
            ->orderBy('nama')
            ->get(['id', 'kode', 'nama', 'no_telepon']);

        return response()->json($suppliers);
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20|unique:supplier,kode',
            'nama' => 'required|string|max:200',
            'alamat' => 'required|string',
            'kontak_person' => 'required|string|max:100',
            'no_telepon' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'no_npwp' => 'nullable|string|max:30',
            'bank' => 'nullable|string|max:50',
            'no_rekening' => 'nullable|string|max:30',
            'atas_nama_rekening' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $supplier = Supplier::create($validator->validated());

        return response()->json([
            'message' => 'Supplier berhasil ditambahkan',
            'data' => $supplier,
        ], 201);
    }

    /**
     * Display the specified supplier.
     */
    public function show(Supplier $supplier): JsonResponse
    {
        $supplier->loadCount('batches');
        $supplier->load([
            'batches' => function ($query) {
                $query->with('obat:id,nama_obat')
                    ->latest()
                    ->limit(10);
            },
        ]);

        return response()->json($supplier);
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kode' => 'required|string|max:20|unique:supplier,kode,' . $supplier->id,
            'nama' => 'required|string|max:200',
            'alamat' => 'required|string',
            'kontak_person' => 'required|string|max:100',
            'no_telepon' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'no_npwp' => 'nullable|string|max:30',
            'bank' => 'nullable|string|max:50',
            'no_rekening' => 'nullable|string|max:30',
            'atas_nama_rekening' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $supplier->update($validator->validated());

        return response()->json([
            'message' => 'Supplier berhasil diperbarui',
            'data' => $supplier,
        ]);
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): JsonResponse
    {
        // Check if supplier has batches
        if ($supplier->batches()->count() > 0) {
            return response()->json([
                'message' => 'Supplier tidak dapat dihapus karena memiliki riwayat pembelian',
            ], 422);
        }

        $supplier->delete();

        return response()->json([
            'message' => 'Supplier berhasil dihapus',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(Supplier $supplier): JsonResponse
    {
        $supplier->update([
            'is_active' => !$supplier->is_active,
        ]);

        return response()->json([
            'message' => 'Status supplier berhasil diubah',
            'data' => $supplier,
        ]);
    }

    /**
     * Get supplier statistics and purchase history.
     */
    public function statistics(Supplier $supplier): JsonResponse
    {
        $stats = [
            'total_batches' => $supplier->batches()->count(),
            'active_batches' => $supplier->batches()
                ->where('status', 'available')
                ->count(),
            'total_obat_types' => $supplier->batches()
                ->distinct('obat_id')
                ->count('obat_id'),
            'latest_purchase' => $supplier->batches()
                ->latest('tanggal_masuk')
                ->first(['tanggal_masuk', 'no_batch']),
        ];

        return response()->json($stats);
    }
}
