<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaksi::with(['obat.satuan', 'batch', 'user', 'unit']);

        // Filter by jenis transaksi
        if ($request->filled('jenis')) {
            $query->where('jenis_transaksi', $request->jenis);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhere('nomor_referensi', 'like', "%{$search}%")
                  ->orWhereHas('obat', function($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $transaksi = $query->latest('tanggal_transaksi')
            ->latest('waktu_transaksi')
            ->paginate(20)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_today' => Transaksi::today()->count(),
            'total_masuk_today' => Transaksi::today()->masuk()->sum('jumlah'),
            'total_keluar_today' => Transaksi::today()->keluar()->sum('jumlah'),
            'total_value_today' => Transaksi::today()->sum('total_harga'),
        ];

        return Inertia::render('transaksi/semua-transaksi', [
            'transaksi' => $transaksi,
            'stats' => $stats,
            'filters' => $request->only(['jenis', 'start_date', 'end_date', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new transaction
     */
    public function create()
    {
        $obat = \App\Models\Obat::with(['satuan', 'kategori'])
            ->where('is_active', true)
            ->orderBy('nama_obat')
            ->get();

        $batches = \App\Models\BatchObat::with(['obat.satuan'])
            ->where('status', 'active')
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired')
            ->get();

        $units = \App\Models\UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get();

        return Inertia::render('transaksi/create', [
            'obat' => $obat,
            'batches' => $batches,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created transaction
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id',
            'batch_id' => 'nullable|exists:batch_obat,id',
            'unit_id' => 'nullable|exists:unit_rumah_sakit,id',
            'jenis_transaksi' => 'required|in:masuk,keluar,penjualan',
            'jumlah' => 'required|integer|min:1',
            'harga_satuan' => 'required|numeric|min:0',
            'tanggal_transaksi' => 'required|date',
            'keterangan' => 'nullable|string',
            'nomor_referensi' => 'nullable|string|max:100',
        ]);

        // Calculate total
        $validated['total_harga'] = $validated['jumlah'] * $validated['harga_satuan'];
        $validated['user_id'] = auth()->id();
        $validated['waktu_transaksi'] = now()->toTimeString();

        // Validate stock for keluar/penjualan
        if (in_array($validated['jenis_transaksi'], ['keluar', 'penjualan'])) {
            if ($validated['batch_id']) {
                $batch = \App\Models\BatchObat::find($validated['batch_id']);
                if ($batch->stok_tersedia < $validated['jumlah']) {
                    return back()->withErrors([
                        'jumlah' => "Stok tidak mencukupi. Tersedia: {$batch->stok_tersedia}"
                    ])->withInput();
                }
            }
        }

        $transaksi = Transaksi::create($validated);

        // Update stock
        $this->updateStock($transaksi);

        return redirect()->route('transaksi.index')
            ->with('success', 'Transaksi berhasil dibuat');
    }

    /**
     * Display the specified transaction
     */
    public function show(string $id)
    {
        $transaksi = Transaksi::with([
            'obat.satuan',
            'obat.kategori',
            'batch',
            'user',
            'unit',
        ])->findOrFail($id);

        return Inertia::render('transaksi/show', [
            'transaksi' => $transaksi,
        ]);
    }

    /**
     * Show the form for editing transaction
     */
    public function edit(string $id)
    {
        $transaksi = Transaksi::with(['obat', 'batch'])->findOrFail($id);

        $obat = \App\Models\Obat::with(['satuan', 'kategori'])
            ->where('is_active', true)
            ->orderBy('nama_obat')
            ->get();

        $batches = \App\Models\BatchObat::with(['obat.satuan'])
            ->where('status', 'active')
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired')
            ->get();

        $units = \App\Models\UnitRumahSakit::where('is_active', true)
            ->orderBy('nama_unit')
            ->get();

        return Inertia::render('transaksi/edit', [
            'transaksi' => $transaksi,
            'obat' => $obat,
            'batches' => $batches,
            'units' => $units,
        ]);
    }

    /**
     * Update the specified transaction
     */
    public function update(Request $request, string $id)
    {
        $transaksi = Transaksi::findOrFail($id);

        // Revert previous stock changes
        $this->revertStock($transaksi);

        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id',
            'batch_id' => 'nullable|exists:batch_obat,id',
            'unit_id' => 'nullable|exists:unit_rumah_sakit,id',
            'jenis_transaksi' => 'required|in:masuk,keluar,penjualan',
            'jumlah' => 'required|integer|min:1',
            'harga_satuan' => 'required|numeric|min:0',
            'tanggal_transaksi' => 'required|date',
            'keterangan' => 'nullable|string',
            'nomor_referensi' => 'nullable|string|max:100',
        ]);

        // Calculate total
        $validated['total_harga'] = $validated['jumlah'] * $validated['harga_satuan'];

        // Validate stock for keluar/penjualan
        if (in_array($validated['jenis_transaksi'], ['keluar', 'penjualan'])) {
            if ($validated['batch_id']) {
                $batch = \App\Models\BatchObat::find($validated['batch_id']);
                if ($batch->stok_tersedia < $validated['jumlah']) {
                    return back()->withErrors([
                        'jumlah' => "Stok tidak mencukupi. Tersedia: {$batch->stok_tersedia}"
                    ])->withInput();
                }
            }
        }

        $transaksi->update($validated);

        // Apply new stock changes
        $this->updateStock($transaksi);

        return redirect()->route('transaksi.index')
            ->with('success', 'Transaksi berhasil diupdate');
    }

    /**
     * Remove the specified transaction
     */
    public function destroy(string $id)
    {
        $transaksi = Transaksi::findOrFail($id);

        // Revert stock changes
        $this->revertStock($transaksi);

        $transaksi->delete();

        return redirect()->route('transaksi.index')
            ->with('success', 'Transaksi berhasil dihapus');
    }

    /**
     * Update stock based on transaction
     */
    protected function updateStock(Transaksi $transaksi)
    {
        if (!$transaksi->batch_id) {
            return;
        }

        $batch = $transaksi->batch;

        if ($transaksi->jenis_transaksi === 'masuk') {
            // Increase stock
            $batch->stok_tersedia += $transaksi->jumlah;
        } else {
            // Decrease stock (keluar/penjualan)
            $batch->stok_tersedia -= $transaksi->jumlah;
            
            // Update batch status if empty
            if ($batch->stok_tersedia <= 0) {
                $batch->status = 'empty';
            }
        }

        $batch->save();

        // Recalculate medicine total stock
        $batch->obat->recalculateStok();
    }

    /**
     * Revert stock changes
     */
    protected function revertStock(Transaksi $transaksi)
    {
        if (!$transaksi->batch_id) {
            return;
        }

        $batch = $transaksi->batch;

        if ($transaksi->jenis_transaksi === 'masuk') {
            // Decrease stock
            $batch->stok_tersedia -= $transaksi->jumlah;
        } else {
            // Increase stock (keluar/penjualan)
            $batch->stok_tersedia += $transaksi->jumlah;
            
            // Restore batch status if was empty
            if ($batch->status === 'empty' && $batch->stok_tersedia > 0) {
                $batch->status = 'active';
            }
        }

        $batch->save();

        // Recalculate medicine total stock
        $batch->obat->recalculateStok();
    }

    /**
     * Display incoming transactions page
     */
    public function masuk(Request $request): Response
    {
        $query = Transaksi::with(['obat.satuan', 'batch', 'user', 'unit'])
            ->where('jenis_transaksi', 'masuk');

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhere('nomor_referensi', 'like', "%{$search}%")
                  ->orWhereHas('obat', function($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $transaksi = $query->latest('tanggal_transaksi')
            ->latest('waktu_transaksi')
            ->paginate(20)
            ->withQueryString();

        // Statistics for incoming transactions
        $stats = [
            'total_today' => Transaksi::today()->masuk()->count(),
            'total_quantity_today' => Transaksi::today()->masuk()->sum('jumlah'),
            'total_value_today' => Transaksi::today()->masuk()->sum('total_harga'),
            'total_this_month' => Transaksi::thisMonth()->masuk()->count(),
        ];

        return Inertia::render('transaksi/barang-masuk', [
            'transaksi' => $transaksi,
            'stats' => $stats,
            'filters' => $request->only(['start_date', 'end_date', 'search']),
        ]);
    }

    /**
     * Display outgoing transactions page
     */
    public function keluar(Request $request): Response
    {
        $query = Transaksi::with(['obat.satuan', 'batch', 'user', 'unit'])
            ->whereIn('jenis_transaksi', ['keluar', 'penjualan']);

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhere('nomor_referensi', 'like', "%{$search}%")
                  ->orWhereHas('obat', function($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $transaksi = $query->latest('tanggal_transaksi')
            ->latest('waktu_transaksi')
            ->paginate(20)
            ->withQueryString();

        // Statistics for outgoing transactions
        $stats = [
            'total_today' => Transaksi::today()->keluar()->count(),
            'total_quantity_today' => Transaksi::today()->keluar()->sum('jumlah'),
            'total_value_today' => Transaksi::today()->keluar()->sum('total_harga'),
            'total_this_month' => Transaksi::thisMonth()->keluar()->count(),
        ];

        return Inertia::render('transaksi/barang-keluar', [
            'transaksi' => $transaksi,
            'stats' => $stats,
            'filters' => $request->only(['start_date', 'end_date', 'search']),
        ]);
    }
}
