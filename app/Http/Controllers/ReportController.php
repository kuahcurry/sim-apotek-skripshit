<?php

namespace App\Http\Controllers;

use App\Models\Obat;
use App\Models\BatchObat;
use App\Models\KategoriObat;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display stock report
     */
    public function stock(Request $request): Response
    {
        $query = Obat::with(['kategori', 'satuan', 'batches' => function ($q) {
            $q->where('stok_tersedia', '>', 0)
              ->whereDate('tanggal_expired', '>', now());
        }]);

        // Filter by kategori
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Filter by stock status
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'habis':
                    $query->where('stok_total', '=', 0);
                    break;
                case 'minimum':
                    $query->where('stok_total', '>', 0)
                          ->whereRaw('stok_total <= stok_minimum');
                    break;
                case 'tersedia':
                    $query->whereRaw('stok_total > stok_minimum');
                    break;
            }
        }

        // Search by name or code
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_obat', 'like', "%{$search}%")
                  ->orWhere('kode_obat', 'like', "%{$search}%");
            });
        }

        $obat = $query->orderBy('nama_obat')->paginate(20)->withQueryString();

        // Calculate statistics
        $stats = [
            'total_obat' => Obat::count(),
            'total_stok' => Obat::sum('stok_total'),
            'stok_minimum' => Obat::whereRaw('stok_total > 0 AND stok_total <= stok_minimum')->count(),
            'stok_habis' => Obat::where('stok_total', 0)->count(),
            'total_value' => BatchObat::where('stok_tersedia', '>', 0)
                ->select(DB::raw('SUM(stok_tersedia * harga_beli) as total'))
                ->value('total') ?? 0,
        ];

        $kategori = KategoriObat::orderBy('nama_kategori')->get(['id', 'nama_kategori']);

        return Inertia::render('laporan/stok', [
            'obat' => $obat,
            'stats' => $stats,
            'kategori' => $kategori,
            'filters' => $request->only(['search', 'kategori_id', 'status']),
        ]);
    }

    public function transactions(Request $request): Response
    {
        $query = Transaksi::with(['obat', 'batch', 'user']);

        // Filter by transaction type
        if ($request->filled('jenis')) {
            $query->where('jenis_transaksi', $request->jenis);
        }

        // Filter by date range
        if ($request->filled('tanggal_dari') && $request->filled('tanggal_sampai')) {
            $query->whereBetween('tanggal_transaksi', [
                $request->tanggal_dari, 
                $request->tanggal_sampai
            ]);
        } elseif ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->tanggal_dari);
        } elseif ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->tanggal_sampai);
        }

        // Search by transaction code or medicine name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhereHas('obat', function ($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $transaksi = $query->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('waktu_transaksi', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Calculate statistics
        $statsQuery = Transaksi::query();
        
        // Apply same filters to statistics
        if ($request->filled('jenis')) {
            $statsQuery->where('jenis_transaksi', $request->jenis);
        }
        if ($request->filled('tanggal_dari') && $request->filled('tanggal_sampai')) {
            $statsQuery->whereBetween('tanggal_transaksi', [
                $request->tanggal_dari, 
                $request->tanggal_sampai
            ]);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $statsQuery->where(function ($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhereHas('obat', function ($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $stats = [
            'total_transaksi' => $statsQuery->count(),
            'total_masuk' => (clone $statsQuery)->where('jenis_transaksi', Transaksi::JENIS_MASUK)->count(),
            'total_keluar' => (clone $statsQuery)->where('jenis_transaksi', Transaksi::JENIS_KELUAR)->count(),
            'total_value' => $statsQuery->sum('total_harga') ?? 0,
        ];

        return Inertia::render('laporan/transaksi', [
            'transaksi' => $transaksi,
            'stats' => $stats,
            'filters' => $request->only(['search', 'jenis', 'tanggal_dari', 'tanggal_sampai']),
        ]);
    }

    public function expiry(Request $request): Response
    {
        $monthsAhead = $request->get('months_ahead', 3);
        $maxDate = now()->addMonths($monthsAhead);

        $query = BatchObat::with(['obat.kategori'])
            ->where('stok_tersedia', '>', 0)
            ->whereDate('tanggal_expired', '<=', $maxDate);

        // Filter by kategori
        if ($request->filled('kategori_id')) {
            $query->whereHas('obat', function ($q) use ($request) {
                $q->where('kategori_id', $request->kategori_id);
            });
        }

        // Filter by status (expired or expiring soon)
        if ($request->filled('status')) {
            if ($request->status === 'expired') {
                $query->whereDate('tanggal_expired', '<', now());
            } elseif ($request->status === 'expiring_soon') {
                $query->whereDate('tanggal_expired', '>=', now());
            }
        }

        // Search by batch number or medicine name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_batch', 'like', "%{$search}%")
                  ->orWhereHas('obat', function ($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $batches = $query->orderBy('tanggal_expired', 'asc')
            ->paginate(20)
            ->withQueryString();

        // Add days_until_expiry to each batch
        $batches->getCollection()->transform(function ($batch) {
            $batch->days_until_expiry = now()->diffInDays($batch->tanggal_expired, false);
            return $batch;
        });

        // Calculate statistics
        $statsQuery = BatchObat::where('stok_tersedia', '>', 0);
        
        // Apply same filters to statistics
        if ($request->filled('kategori_id')) {
            $statsQuery->whereHas('obat', function ($q) use ($request) {
                $q->where('kategori_id', $request->kategori_id);
            });
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $statsQuery->where(function ($q) use ($search) {
                $q->where('nomor_batch', 'like', "%{$search}%")
                  ->orWhereHas('obat', function ($q) use ($search) {
                      $q->where('nama_obat', 'like', "%{$search}%")
                        ->orWhere('kode_obat', 'like', "%{$search}%");
                  });
            });
        }

        $now = now();
        $thisMonthEnd = now()->endOfMonth();
        $nextMonthEnd = now()->addMonth()->endOfMonth();

        $stats = [
            'expired' => (clone $statsQuery)->whereDate('tanggal_expired', '<', $now)->count(),
            'expiring_this_month' => (clone $statsQuery)
                ->whereDate('tanggal_expired', '>=', $now)
                ->whereDate('tanggal_expired', '<=', $thisMonthEnd)
                ->count(),
            'expiring_next_month' => (clone $statsQuery)
                ->whereDate('tanggal_expired', '>', $thisMonthEnd)
                ->whereDate('tanggal_expired', '<=', $nextMonthEnd)
                ->count(),
            'total_batches' => (clone $statsQuery)->whereDate('tanggal_expired', '<=', $maxDate)->count(),
            'total_value_at_risk' => (clone $statsQuery)
                ->whereDate('tanggal_expired', '<=', $maxDate)
                ->get()
                ->sum(function ($batch) {
                    return $batch->stok_tersedia * $batch->harga_beli;
                }),
        ];

        $kategori = KategoriObat::orderBy('nama_kategori')->get(['id', 'nama_kategori']);

        return Inertia::render('laporan/kadaluarsa', [
            'batches' => $batches,
            'stats' => $stats,
            'kategori' => $kategori,
            'filters' => $request->only(['search', 'kategori_id', 'months_ahead', 'status']),
        ]);
    }
}
