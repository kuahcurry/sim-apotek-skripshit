<?php

namespace App\Http\Controllers;

use App\Models\PermintaanUnit;
use App\Models\Obat;
use App\Models\UnitRumahSakit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermintaanUnitController extends Controller
{
    /**
     * Display a listing of permintaan unit
     */
    public function index(Request $request): Response
    {
        $query = PermintaanUnit::with(['unit', 'obat.satuan', 'processedBy']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by prioritas
        if ($request->filled('prioritas')) {
            $query->where('prioritas', $request->prioritas);
        }

        // Filter by unit
        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_permintaan', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_permintaan', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_permintaan', 'like', "%{$search}%")
                  ->orWhereHas('obat', function($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  })
                  ->orWhereHas('unit', function($q) use ($search) {
                      $q->where('nama_unit', 'like', "%{$search}%");
                  });
            });
        }

        $permintaan = $query->latest('tanggal_permintaan')
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_pending' => PermintaanUnit::pending()->count(),
            'total_processed' => PermintaanUnit::processed()->count(),
            'total_urgent' => PermintaanUnit::urgent()->pending()->count(),
            'total_today' => PermintaanUnit::whereDate('tanggal_permintaan', today())->count(),
        ];

        // Get units for filter
        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get(['id', 'nama_unit']);

        return Inertia::render('permintaan/index', [
            'permintaan' => $permintaan,
            'stats' => $stats,
            'units' => $units,
            'filters' => $request->only(['status', 'prioritas', 'unit_id', 'start_date', 'end_date', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new permintaan
     */
    public function create(): Response
    {
        $obat = Obat::with(['satuan', 'kategori'])
            ->where('is_active', true)
            ->orderBy('nama_obat')
            ->get();

        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get();

        return Inertia::render('permintaan/create', [
            'obat' => $obat,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created permintaan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:unit_rumah_sakit,id',
            'obat_id' => 'required|exists:obat,id',
            'jumlah_diminta' => 'required|integer|min:1',
            'prioritas' => 'required|in:normal,urgent,emergency',
            'catatan' => 'nullable|string|max:500',
        ]);

        $validated['tanggal_permintaan'] = now()->toDateString();
        $validated['status'] = PermintaanUnit::STATUS_PENDING;

        PermintaanUnit::create($validated);

        return redirect()->route('permintaan.index')
            ->with('success', 'Permintaan berhasil dibuat');
    }

    /**
     * Display the specified permintaan
     */
    public function show(string $id): Response
    {
        $permintaan = PermintaanUnit::with(['unit', 'obat.satuan', 'obat.kategori', 'processedBy'])
            ->findOrFail($id);

        return Inertia::render('permintaan/show', [
            'permintaan' => $permintaan,
        ]);
    }

    /**
     * Show the form for editing permintaan
     */
    public function edit(string $id): Response
    {
        $permintaan = PermintaanUnit::with(['unit', 'obat'])->findOrFail($id);

        // Only allow editing if status is pending
        if (!$permintaan->isPending()) {
            return redirect()->route('permintaan.show', $id)
                ->with('error', 'Permintaan tidak dapat diubah');
        }

        $obat = Obat::with(['satuan', 'kategori'])
            ->where('is_active', true)
            ->orderBy('nama_obat')
            ->get();

        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get();

        return Inertia::render('permintaan/edit', [
            'permintaan' => $permintaan,
            'obat' => $obat,
            'units' => $units,
        ]);
    }

    /**
     * Update the specified permintaan
     */
    public function update(Request $request, string $id)
    {
        $permintaan = PermintaanUnit::findOrFail($id);

        // Only allow updating if status is pending
        if (!$permintaan->isPending()) {
            return redirect()->route('permintaan.show', $id)
                ->with('error', 'Permintaan tidak dapat diubah');
        }

        $validated = $request->validate([
            'unit_id' => 'required|exists:unit_rumah_sakit,id',
            'obat_id' => 'required|exists:obat,id',
            'jumlah_diminta' => 'required|integer|min:1',
            'prioritas' => 'required|in:normal,urgent,emergency',
            'catatan' => 'nullable|string|max:500',
        ]);

        $permintaan->update($validated);

        return redirect()->route('permintaan.index')
            ->with('success', 'Permintaan berhasil diperbarui');
    }

    /**
     * Remove the specified permintaan
     */
    public function destroy(string $id)
    {
        $permintaan = PermintaanUnit::findOrFail($id);

        // Only allow deleting if status is pending
        if (!$permintaan->isPending()) {
            return redirect()->back()
                ->with('error', 'Permintaan tidak dapat dihapus');
        }

        $permintaan->delete();

        return redirect()->route('permintaan.index')
            ->with('success', 'Permintaan berhasil dihapus');
    }

    /**
     * Process permintaan (approve/reject)
     */
    public function process(Request $request, string $id)
    {
        $permintaan = PermintaanUnit::findOrFail($id);

        if (!$permintaan->isPending()) {
            return redirect()->back()
                ->with('error', 'Permintaan sudah diproses');
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'jumlah_disetujui' => 'required_if:action,approve|integer|min:1',
            'catatan_farmasi' => 'nullable|string|max:500',
        ]);

        if ($validated['action'] === 'approve') {
            $permintaan->markAsProcessed(
                auth()->user(),
                $validated['jumlah_disetujui'],
                $validated['catatan_farmasi'] ?? null
            );
            $message = 'Permintaan berhasil disetujui';
        } else {
            $permintaan->markAsCancelled($validated['catatan_farmasi'] ?? 'Ditolak oleh farmasi');
            $message = 'Permintaan berhasil ditolak';
        }

        return redirect()->route('permintaan.index')
            ->with('success', $message);
    }

    /**
     * Mark permintaan as completed
     */
    public function complete(string $id)
    {
        $permintaan = PermintaanUnit::findOrFail($id);

        if ($permintaan->status !== PermintaanUnit::STATUS_PROCESSED) {
            return redirect()->back()
                ->with('error', 'Permintaan harus diproses terlebih dahulu');
        }

        $permintaan->markAsCompleted();

        return redirect()->route('permintaan.index')
            ->with('success', 'Permintaan telah diselesaikan');
    }
}
