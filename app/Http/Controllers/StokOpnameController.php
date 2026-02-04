<?php

namespace App\Http\Controllers;

use App\Models\StokOpname;
use App\Models\BatchObat;
use App\Models\UnitRumahSakit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StokOpnameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = StokOpname::with(['penanggungJawab', 'approvedBy', 'unit'])
            ->latest('tanggal_opname');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by unit
        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_opname', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_opname', '<=', $request->end_date);
        }

        // Search by nomor opname or unit name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_opname', 'like', "%{$search}%")
                  ->orWhereHas('unit', function ($q) use ($search) {
                      $q->where('nama_unit', 'like', "%{$search}%");
                  });
            });
        }

        $stokOpname = $query->paginate(20)->withQueryString();

        // Calculate statistics
        $stats = [
            'total_draft' => StokOpname::where('status', StokOpname::STATUS_DRAFT)->count(),
            'total_in_progress' => StokOpname::where('status', StokOpname::STATUS_IN_PROGRESS)->count(),
            'total_completed' => StokOpname::where('status', StokOpname::STATUS_COMPLETED)->count(),
            'total_approved' => StokOpname::where('status', StokOpname::STATUS_APPROVED)->count(),
        ];

        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get(['id', 'nama_unit', 'kode_unit']);

        return Inertia::render('stok-opname/index', [
            'stokOpname' => $stokOpname,
            'stats' => $stats,
            'units' => $units,
            'filters' => $request->only(['search', 'status', 'unit_id', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get(['id', 'nama_unit', 'kode_unit']);

        // Get all batches with available stock
        $batches = BatchObat::with(['obat.kategori', 'obat.satuan'])
            ->where('stok_tersedia', '>', 0)
            ->whereDate('tanggal_expired', '>', now())
            ->orderBy('tanggal_expired')
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'nomor_batch' => $batch->nomor_batch,
                    'obat' => [
                        'id' => $batch->obat->id,
                        'nama_obat' => $batch->obat->nama_obat,
                        'kode_obat' => $batch->obat->kode_obat,
                        'kategori' => $batch->obat->kategori,
                        'satuan' => $batch->obat->satuan,
                    ],
                    'stok_tersedia' => $batch->stok_tersedia,
                    'tanggal_kadaluarsa' => $batch->tanggal_expired->format('Y-m-d'),
                ];
            });

        return Inertia::render('stok-opname/create', [
            'units' => $units,
            'batches' => $batches,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id' => 'required|exists:unit_rumah_sakit,id',
            'tanggal_opname' => 'required|date',
            'catatan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.batch_id' => 'required|exists:batch_obat,id',
            'details.*.stok_fisik' => 'required|integer|min:0',
            'details.*.keterangan_selisih' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create stock opname
            $opname = StokOpname::create([
                'tanggal_opname' => $validated['tanggal_opname'],
                'penanggung_jawab' => auth()->id(),
                'unit_id' => $validated['unit_id'],
                'status' => StokOpname::STATUS_DRAFT,
                'catatan' => $validated['catatan'],
            ]);

            // Create details
            foreach ($validated['details'] as $detail) {
                $batch = BatchObat::findOrFail($detail['batch_id']);
                
                $opname->details()->create([
                    'batch_id' => $detail['batch_id'],
                    'stok_sistem' => $batch->stok_tersedia,
                    'stok_fisik' => $detail['stok_fisik'],
                    'keterangan_selisih' => $detail['keterangan_selisih'],
                ]);
            }

            DB::commit();

            return redirect()->route('stok-opname.show', $opname->id)
                ->with('success', 'Stok opname berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat stok opname: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(StokOpname $stokOpname): Response
    {
        $stokOpname->load([
            'details.batch.obat.kategori',
            'details.batch.obat.satuan',
            'penanggungJawab',
            'approvedBy',
            'unit'
        ]);

        return Inertia::render('stok-opname/show', [
            'stokOpname' => $stokOpname,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StokOpname $stokOpname): Response
    {
        // Only allow editing for draft status
        if ($stokOpname->status !== StokOpname::STATUS_DRAFT) {
            return redirect()->route('stok-opname.show', $stokOpname->id)
                ->with('error', 'Hanya stok opname dengan status draft yang dapat diedit');
        }

        $stokOpname->load([
            'details.batch.obat.kategori',
            'details.batch.obat.satuan',
            'unit'
        ]);

        $units = UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get(['id', 'nama_unit', 'kode_unit']);

        $batches = BatchObat::with(['obat.kategori', 'obat.satuan'])
            ->where('stok_tersedia', '>', 0)
            ->whereDate('tanggal_expired', '>', now())
            ->orderBy('tanggal_expired')
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'nomor_batch' => $batch->nomor_batch,
                    'obat' => [
                        'id' => $batch->obat->id,
                        'nama_obat' => $batch->obat->nama_obat,
                        'kode_obat' => $batch->obat->kode_obat,
                        'kategori' => $batch->obat->kategori,
                        'satuan' => $batch->obat->satuan,
                    ],
                    'stok_tersedia' => $batch->stok_tersedia,
                    'tanggal_kadaluarsa' => $batch->tanggal_expired->format('Y-m-d'),
                ];
            });

        return Inertia::render('stok-opname/edit', [
            'stokOpname' => $stokOpname,
            'units' => $units,
            'batches' => $batches,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StokOpname $stokOpname)
    {
        // Only allow updating for draft status
        if ($stokOpname->status !== StokOpname::STATUS_DRAFT) {
            return back()->withErrors(['error' => 'Hanya stok opname dengan status draft yang dapat diubah']);
        }

        $validated = $request->validate([
            'unit_id' => 'required|exists:unit_rumah_sakit,id',
            'tanggal_opname' => 'required|date',
            'catatan' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.batch_id' => 'required|exists:batch_obat,id',
            'details.*.stok_fisik' => 'required|integer|min:0',
            'details.*.keterangan_selisih' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $stokOpname->update([
                'tanggal_opname' => $validated['tanggal_opname'],
                'unit_id' => $validated['unit_id'],
                'catatan' => $validated['catatan'],
            ]);

            // Delete existing details and create new ones
            $stokOpname->details()->delete();

            foreach ($validated['details'] as $detail) {
                $batch = BatchObat::findOrFail($detail['batch_id']);
                
                $stokOpname->details()->create([
                    'batch_id' => $detail['batch_id'],
                    'stok_sistem' => $batch->stok_tersedia,
                    'stok_fisik' => $detail['stok_fisik'],
                    'keterangan_selisih' => $detail['keterangan_selisih'],
                ]);
            }

            DB::commit();

            return redirect()->route('stok-opname.show', $stokOpname->id)
                ->with('success', 'Stok opname berhasil diubah');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengubah stok opname: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StokOpname $stokOpname)
    {
        // Only allow deleting for draft status
        if ($stokOpname->status !== StokOpname::STATUS_DRAFT) {
            return back()->withErrors(['error' => 'Hanya stok opname dengan status draft yang dapat dihapus']);
        }

        $stokOpname->delete();

        return redirect()->route('stok-opname.index')
            ->with('success', 'Stok opname berhasil dihapus');
    }

    /**
     * Mark stock opname as in progress
     */
    public function startOpname(StokOpname $stokOpname)
    {
        if ($stokOpname->status !== StokOpname::STATUS_DRAFT) {
            return back()->withErrors(['error' => 'Stok opname sudah dimulai']);
        }

        $stokOpname->update(['status' => StokOpname::STATUS_IN_PROGRESS]);

        return back()->with('success', 'Stok opname dimulai');
    }

    /**
     * Mark stock opname as completed
     */
    public function completeOpname(StokOpname $stokOpname)
    {
        if ($stokOpname->status !== StokOpname::STATUS_IN_PROGRESS) {
            return back()->withErrors(['error' => 'Stok opname belum dimulai atau sudah selesai']);
        }

        $stokOpname->update(['status' => StokOpname::STATUS_COMPLETED]);

        return back()->with('success', 'Stok opname selesai, menunggu approval');
    }

    /**
     * Approve stock opname
     */
    public function approve(Request $request, StokOpname $stokOpname)
    {
        if ($stokOpname->status !== StokOpname::STATUS_COMPLETED) {
            return back()->withErrors(['error' => 'Stok opname belum selesai']);
        }

        $validated = $request->validate([
            'berita_acara' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $stokOpname->approve(auth()->user());
            
            if (isset($validated['berita_acara'])) {
                $stokOpname->update(['berita_acara' => $validated['berita_acara']]);
            }

            DB::commit();

            return redirect()->route('stok-opname.show', $stokOpname->id)
                ->with('success', 'Stok opname berhasil disetujui dan stok telah diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyetujui stok opname: ' . $e->getMessage()]);
        }
    }
}
