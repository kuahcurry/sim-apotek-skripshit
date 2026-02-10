# Implementation Guide: Critical Features for Indonesian Hospital Compliance

## Overview
This guide provides step-by-step implementation instructions for the three critical features required for Indonesian hospital pharmacy compliance:

1. **Narkotika & Psikotropika Module** (Legal Requirement - UU 35/2009)
2. **BPJS/JKN Integration** (60% Market Coverage - Perpres 12/2013)
3. **Formularium Management** (Hospital Requirement - KFT)

---

## 1. NARKOTIKA & PSIKOTROPIKA MODULE

### Priority: CRITICAL (Legal Requirement)
**Timeline**: 4-6 weeks
**Regulatory Basis**: UU 35/2009, Permenkes 3/2015

### 1.1 Database Schema

Create migration: `2026_02_11_000001_create_narkotika_psikotropika_module.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add golongan to obat table
        Schema::table('obat', function (Blueprint $table) {
            $table->enum('golongan_obat', [
                'BEBAS',           // OTC
                'BEBAS_TERBATAS',  // Limited OTC
                'KERAS',           // Prescription only
                'NARKOTIKA',       // Narcotics
                'PSIKOTROPIKA'     // Psychotropics
            ])->default('BEBAS')->after('satuan_id');
            
            $table->string('golongan_narkotika', 20)->nullable()->after('golongan_obat'); // I, II, III
            $table->string('golongan_psikotropika', 20)->nullable()->after('golongan_narkotika'); // I, II, III, IV
        });

        // Narkotika/Psikotropika transactions (special book)
        Schema::create('narkotika_transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obat_id')->constrained('obat')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users'); // Apoteker responsible
            
            $table->enum('jenis_transaksi', ['MASUK', 'KELUAR']);
            $table->date('tanggal_transaksi');
            $table->time('waktu_transaksi');
            
            // Stock movement
            $table->integer('jumlah');
            $table->integer('stok_sebelum');
            $table->integer('stok_sesudah');
            
            // For MASUK (incoming)
            $table->foreignId('supplier_id')->nullable()->constrained('supplier');
            $table->string('nomor_faktur')->nullable();
            $table->string('nomor_sp')->nullable(); // Surat Pesanan number
            
            // For KELUAR (outgoing)
            $table->foreignId('resep_id')->nullable()->constrained('resep');
            $table->string('nomor_resep')->nullable();
            $table->string('nama_pasien')->nullable();
            $table->text('alamat_pasien')->nullable();
            $table->string('nama_dokter')->nullable();
            $table->string('sip_dokter')->nullable(); // Doctor's license
            
            // Additional info
            $table->text('keterangan')->nullable();
            $table->string('ttd_apoteker')->nullable(); // Digital signature path
            $table->string('ttd_penerima')->nullable(); // Recipient signature
            
            $table->timestamps();
            
            $table->index(['obat_id', 'tanggal_transaksi']);
            $table->index('jenis_transaksi');
        });

        // Daily balance record (required by law)
        Schema::create('narkotika_saldo_harian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obat_id')->constrained('obat');
            $table->date('tanggal');
            
            $table->integer('saldo_awal');
            $table->integer('total_masuk')->default(0);
            $table->integer('total_keluar')->default(0);
            $table->integer('saldo_akhir');
            
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            
            $table->unique(['obat_id', 'tanggal']);
        });

        // Surat Pesanan (Order Letter for Narcotics)
        Schema::create('surat_pesanan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_sp')->unique(); // SP-001/APT/I/2026
            $table->date('tanggal_sp');
            
            $table->foreignId('supplier_id')->constrained('supplier');
            $table->foreignId('dibuat_oleh')->constrained('users'); // Pharmacist
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users'); // Chief pharmacist
            
            $table->enum('status', ['DRAFT', 'DIAJUKAN', 'DISETUJUI', 'DITERIMA', 'DIBATALKAN'])
                  ->default('DRAFT');
            
            $table->text('keterangan')->nullable();
            $table->string('file_sp')->nullable(); // PDF file path
            
            $table->timestamp('tanggal_disetujui')->nullable();
            $table->timestamp('tanggal_diterima')->nullable();
            
            $table->timestamps();
        });

        Schema::create('surat_pesanan_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surat_pesanan_id')->constrained('surat_pesanan')->onDelete('cascade');
            $table->foreignId('obat_id')->constrained('obat');
            
            $table->integer('jumlah_dipesan');
            $table->integer('jumlah_diterima')->default(0);
            $table->decimal('harga_satuan', 15, 2)->nullable();
            $table->text('keterangan')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('surat_pesanan_detail');
        Schema::dropIfExists('surat_pesanan');
        Schema::dropIfExists('narkotika_saldo_harian');
        Schema::dropIfExists('narkotika_transaksi');
        
        Schema::table('obat', function (Blueprint $table) {
            $table->dropColumn(['golongan_obat', 'golongan_narkotika', 'golongan_psikotropika']);
        });
    }
};
```

### 1.2 Models

**app/Models/NarkotikaTransaksi.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NarkotikaTransaksi extends Model
{
    protected $table = 'narkotika_transaksi';
    
    protected $fillable = [
        'obat_id', 'user_id', 'jenis_transaksi', 'tanggal_transaksi', 
        'waktu_transaksi', 'jumlah', 'stok_sebelum', 'stok_sesudah',
        'supplier_id', 'nomor_faktur', 'nomor_sp',
        'resep_id', 'nomor_resep', 'nama_pasien', 'alamat_pasien',
        'nama_dokter', 'sip_dokter', 'keterangan', 
        'ttd_apoteker', 'ttd_penerima'
    ];

    protected $casts = [
        'tanggal_transaksi' => 'date',
    ];

    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function resep(): BelongsTo
    {
        return $this->belongsTo(Resep::class);
    }
}
```

**app/Models/NarkotikaSaldoHarian.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NarkotikaSaldoHarian extends Model
{
    protected $table = 'narkotika_saldo_harian';
    
    protected $fillable = [
        'obat_id', 'tanggal', 'saldo_awal', 'total_masuk', 
        'total_keluar', 'saldo_akhir', 'verified_by', 'verified_at'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'verified_at' => 'datetime',
    ];

    public function obat()
    {
        return $this->belongsTo(Obat::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
```

**app/Models/SuratPesanan.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SuratPesanan extends Model
{
    protected $table = 'surat_pesanan';
    
    protected $fillable = [
        'nomor_sp', 'tanggal_sp', 'supplier_id', 
        'dibuat_oleh', 'disetujui_oleh', 'status',
        'keterangan', 'file_sp', 'tanggal_disetujui', 'tanggal_diterima'
    ];

    protected $casts = [
        'tanggal_sp' => 'date',
        'tanggal_disetujui' => 'datetime',
        'tanggal_diterima' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function dibuatOleh()
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function disetujuiOleh()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function details()
    {
        return $this->hasMany(SuratPesananDetail::class);
    }

    public function generateNomorSP()
    {
        $count = static::whereYear('tanggal_sp', now()->year)
                      ->whereMonth('tanggal_sp', now()->month)
                      ->count() + 1;
        
        $romanMonth = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now()->month - 1];
        
        return sprintf('SP-%03d/APT/%s/%d', $count, $romanMonth, now()->year);
    }
}
```

### 1.3 Controller

**app/Http/Controllers/NarkotikaController.php**
```php
<?php

namespace App\Http\Controllers;

use App\Models\NarkotikaTransaksi;
use App\Models\NarkotikaSaldoHarian;
use App\Models\Obat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NarkotikaController extends Controller
{
    // Buku Khusus (Special Book) - Main page
    public function index(Request $request)
    {
        $query = NarkotikaTransaksi::with(['obat', 'user', 'supplier', 'resep'])
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('waktu_transaksi', 'desc');

        if ($request->filled('obat_id')) {
            $query->where('obat_id', $request->obat_id);
        }

        if ($request->filled('jenis_transaksi')) {
            $query->where('jenis_transaksi', $request->jenis_transaksi);
        }

        if ($request->filled('tanggal_dari')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->tanggal_dari);
        }

        if ($request->filled('tanggal_sampai')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->tanggal_sampai);
        }

        $transaksi = $query->paginate(50);

        $obatNarkotika = Obat::whereIn('golongan_obat', ['NARKOTIKA', 'PSIKOTROPIKA'])
            ->select('id', 'nama_obat', 'golongan_obat', 'golongan_narkotika', 'golongan_psikotropika')
            ->orderBy('nama_obat')
            ->get();

        return Inertia::render('narkotika/index', [
            'transaksi' => $transaksi,
            'obatNarkotika' => $obatNarkotika,
            'filters' => $request->only(['obat_id', 'jenis_transaksi', 'tanggal_dari', 'tanggal_sampai'])
        ]);
    }

    // Record incoming narcotics
    public function storeMasuk(Request $request)
    {
        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id',
            'tanggal_transaksi' => 'required|date',
            'waktu_transaksi' => 'required',
            'jumlah' => 'required|integer|min:1',
            'supplier_id' => 'required|exists:supplier,id',
            'nomor_faktur' => 'required|string|max:100',
            'nomor_sp' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $obat = Obat::findOrFail($validated['obat_id']);
            
            // Check if obat is narcotic/psychotropic
            if (!in_array($obat->golongan_obat, ['NARKOTIKA', 'PSIKOTROPIKA'])) {
                return back()->withErrors(['obat_id' => 'Obat bukan termasuk narkotika/psikotropika']);
            }

            $stokSebelum = $obat->stok_total ?? 0;
            $stokSesudah = $stokSebelum + $validated['jumlah'];

            // Create transaction record
            $transaksi = NarkotikaTransaksi::create([
                'obat_id' => $validated['obat_id'],
                'user_id' => auth()->id(),
                'jenis_transaksi' => 'MASUK',
                'tanggal_transaksi' => $validated['tanggal_transaksi'],
                'waktu_transaksi' => $validated['waktu_transaksi'],
                'jumlah' => $validated['jumlah'],
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSesudah,
                'supplier_id' => $validated['supplier_id'],
                'nomor_faktur' => $validated['nomor_faktur'],
                'nomor_sp' => $validated['nomor_sp'],
                'keterangan' => $validated['keterangan'] ?? null,
                'ttd_apoteker' => auth()->user()->name,
            ]);

            // Update stock
            $obat->update(['stok_total' => $stokSesudah]);

            // Update daily balance
            $this->updateDailyBalance($validated['obat_id'], $validated['tanggal_transaksi']);

            DB::commit();

            return redirect()->route('narkotika.index')
                ->with('success', 'Transaksi masuk narkotika berhasil dicatat');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mencatat transaksi: ' . $e->getMessage()]);
        }
    }

    // Record outgoing narcotics
    public function storeKeluar(Request $request)
    {
        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id',
            'tanggal_transaksi' => 'required|date',
            'waktu_transaksi' => 'required',
            'jumlah' => 'required|integer|min:1',
            'resep_id' => 'nullable|exists:resep,id',
            'nomor_resep' => 'required|string|max:100',
            'nama_pasien' => 'required|string|max:200',
            'alamat_pasien' => 'required|string',
            'nama_dokter' => 'required|string|max:200',
            'sip_dokter' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
            'ttd_penerima' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $obat = Obat::findOrFail($validated['obat_id']);
            
            if (!in_array($obat->golongan_obat, ['NARKOTIKA', 'PSIKOTROPIKA'])) {
                return back()->withErrors(['obat_id' => 'Obat bukan termasuk narkotika/psikotropika']);
            }

            $stokSebelum = $obat->stok_total ?? 0;
            
            if ($stokSebelum < $validated['jumlah']) {
                return back()->withErrors(['jumlah' => 'Stok tidak mencukupi']);
            }

            $stokSesudah = $stokSebelum - $validated['jumlah'];

            $transaksi = NarkotikaTransaksi::create([
                'obat_id' => $validated['obat_id'],
                'user_id' => auth()->id(),
                'jenis_transaksi' => 'KELUAR',
                'tanggal_transaksi' => $validated['tanggal_transaksi'],
                'waktu_transaksi' => $validated['waktu_transaksi'],
                'jumlah' => $validated['jumlah'],
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSesudah,
                'resep_id' => $validated['resep_id'] ?? null,
                'nomor_resep' => $validated['nomor_resep'],
                'nama_pasien' => $validated['nama_pasien'],
                'alamat_pasien' => $validated['alamat_pasien'],
                'nama_dokter' => $validated['nama_dokter'],
                'sip_dokter' => $validated['sip_dokter'],
                'keterangan' => $validated['keterangan'] ?? null,
                'ttd_apoteker' => auth()->user()->name,
                'ttd_penerima' => $validated['ttd_penerima'] ?? null,
            ]);

            $obat->update(['stok_total' => $stokSesudah]);

            $this->updateDailyBalance($validated['obat_id'], $validated['tanggal_transaksi']);

            DB::commit();

            return redirect()->route('narkotika.index')
                ->with('success', 'Transaksi keluar narkotika berhasil dicatat');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mencatat transaksi: ' . $e->getMessage()]);
        }
    }

    // Generate daily balance report
    public function dailyBalance(Request $request)
    {
        $tanggal = $request->input('tanggal', now()->format('Y-m-d'));
        
        $saldoHarian = NarkotikaSaldoHarian::with(['obat', 'verifiedBy'])
            ->whereDate('tanggal', $tanggal)
            ->get();

        return Inertia::render('narkotika/saldo-harian', [
            'saldoHarian' => $saldoHarian,
            'tanggal' => $tanggal,
        ]);
    }

    // Helper method to update daily balance
    private function updateDailyBalance($obatId, $tanggal)
    {
        $tanggal = \Carbon\Carbon::parse($tanggal)->format('Y-m-d');
        
        // Get all transactions for this obat on this date
        $transaksi = NarkotikaTransaksi::where('obat_id', $obatId)
            ->whereDate('tanggal_transaksi', $tanggal)
            ->orderBy('waktu_transaksi')
            ->get();

        if ($transaksi->isEmpty()) {
            return;
        }

        $saldoAwal = $transaksi->first()->stok_sebelum;
        $totalMasuk = $transaksi->where('jenis_transaksi', 'MASUK')->sum('jumlah');
        $totalKeluar = $transaksi->where('jenis_transaksi', 'KELUAR')->sum('jumlah');
        $saldoAkhir = $transaksi->last()->stok_sesudah;

        NarkotikaSaldoHarian::updateOrCreate(
            [
                'obat_id' => $obatId,
                'tanggal' => $tanggal,
            ],
            [
                'saldo_awal' => $saldoAwal,
                'total_masuk' => $totalMasuk,
                'total_keluar' => $totalKeluar,
                'saldo_akhir' => $saldoAkhir,
            ]
        );
    }

    // Export to PDF (required by law for inspection)
    public function exportBukuKhusus(Request $request)
    {
        $bulan = $request->input('bulan', now()->month);
        $tahun = $request->input('tahun', now()->year);

        // Implementation using Laravel PDF library (barryvdh/laravel-dompdf)
        // Return PDF with proper format as per Permenkes requirements
    }
}
```

### 1.4 Routes

**routes/narkotika.php** (create new file)
```php
<?php

use App\Http\Controllers\NarkotikaController;
use App\Http\Controllers\SuratPesananController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // Buku Khusus Narkotika
    Route::get('/narkotika', [NarkotikaController::class, 'index'])->name('narkotika.index');
    Route::post('/narkotika/masuk', [NarkotikaController::class, 'storeMasuk'])->name('narkotika.masuk');
    Route::post('/narkotika/keluar', [NarkotikaController::class, 'storeKeluar'])->name('narkotika.keluar');
    Route::get('/narkotika/saldo-harian', [NarkotikaController::class, 'dailyBalance'])->name('narkotika.saldo-harian');
    Route::get('/narkotika/export-buku-khusus', [NarkotikaController::class, 'exportBukuKhusus'])->name('narkotika.export');
    
    // Surat Pesanan
    Route::resource('surat-pesanan', SuratPesananController::class);
    Route::post('/surat-pesanan/{id}/setujui', [SuratPesananController::class, 'approve'])->name('surat-pesanan.approve');
    Route::post('/surat-pesanan/{id}/terima', [SuratPesananController::class, 'receive'])->name('surat-pesanan.receive');
    Route::get('/surat-pesanan/{id}/print', [SuratPesananController::class, 'print'])->name('surat-pesanan.print');
});
```

Add to **bootstrap/app.php** or **routes/web.php**:
```php
require __DIR__.'/narkotika.php';
```

### 1.5 Frontend Components

**resources/js/pages/narkotika/index.tsx**
```tsx
import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Transaksi {
    id: number;
    obat: { nama_obat: string; golongan_obat: string };
    jenis_transaksi: 'MASUK' | 'KELUAR';
    tanggal_transaksi: string;
    waktu_transaksi: string;
    jumlah: number;
    stok_sebelum: number;
    stok_sesudah: number;
    nomor_resep?: string;
    nama_pasien?: string;
    nama_dokter?: string;
    supplier?: { nama: string };
    nomor_faktur?: string;
    user: { name: string };
}

export default function NarkotikaIndex({ 
    transaksi, 
    obatNarkotika, 
    filters 
}: { 
    transaksi: { data: Transaksi[]; links: any[] };
    obatNarkotika: any[];
    filters: any;
}) {
    return (
        <AuthenticatedLayout>
            <Head title="Buku Khusus Narkotika & Psikotropika" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>📋 Buku Khusus Narkotika & Psikotropika</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => router.get(route('narkotika.saldo-harian'))}>
                                        Saldo Harian
                                    </Button>
                                    <Button variant="outline" onClick={() => router.get(route('surat-pesanan.index'))}>
                                        Surat Pesanan
                                    </Button>
                                    <Button onClick={() => router.get(route('narkotika.export'))}>
                                        Export PDF
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="transaksi">
                                <TabsList>
                                    <TabsTrigger value="transaksi">Riwayat Transaksi</TabsTrigger>
                                    <TabsTrigger value="masuk">Tambah Masuk</TabsTrigger>
                                    <TabsTrigger value="keluar">Tambah Keluar</TabsTrigger>
                                </TabsList>

                                <TabsContent value="transaksi">
                                    {/* Filter section */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded">
                                        {/* Add filters for obat, jenis_transaksi, date range */}
                                    </div>

                                    {/* Transaction table */}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>Nama Obat</TableHead>
                                                <TableHead>Jenis</TableHead>
                                                <TableHead>Jumlah</TableHead>
                                                <TableHead>Stok Sebelum</TableHead>
                                                <TableHead>Stok Sesudah</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                                <TableHead>Apoteker</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transaksi.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.tanggal_transaksi}</TableCell>
                                                    <TableCell>{item.waktu_transaksi}</TableCell>
                                                    <TableCell>
                                                        {item.obat.nama_obat}
                                                        <br />
                                                        <Badge variant="secondary" className="text-xs">
                                                            {item.obat.golongan_obat}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.jenis_transaksi === 'MASUK' ? 'default' : 'destructive'}>
                                                            {item.jenis_transaksi}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{item.jumlah}</TableCell>
                                                    <TableCell>{item.stok_sebelum}</TableCell>
                                                    <TableCell>{item.stok_sesudah}</TableCell>
                                                    <TableCell>
                                                        {item.jenis_transaksi === 'MASUK' ? (
                                                            <>
                                                                <div>Supplier: {item.supplier?.nama}</div>
                                                                <div className="text-xs">Faktur: {item.nomor_faktur}</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>Pasien: {item.nama_pasien}</div>
                                                                <div className="text-xs">Resep: {item.nomor_resep}</div>
                                                                <div className="text-xs">Dokter: {item.nama_dokter}</div>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{item.user.name}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="masuk">
                                    {/* Form for incoming narcotics - similar to existing form patterns */}
                                    <FormTransaksiMasuk obatNarkotika={obatNarkotika} />
                                </TabsContent>

                                <TabsContent value="keluar">
                                    {/* Form for outgoing narcotics */}
                                    <FormTransaksiKeluar obatNarkotika={obatNarkotika} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Separate form components for masuk and keluar
function FormTransaksiMasuk({ obatNarkotika }: { obatNarkotika: any[] }) {
    // Implementation with form fields: obat, tanggal, waktu, jumlah, supplier, nomor_faktur, nomor_sp
    return <div>Form Transaksi Masuk</div>;
}

function FormTransaksiKeluar({ obatNarkotika }: { obatNarkotika: any[] }) {
    // Implementation with form fields: obat, tanggal, waktu, jumlah, resep, nomor_resep, 
    // nama_pasien, alamat_pasien, nama_dokter, sip_dokter
    return <div>Form Transaksi Keluar</div>;
}
```

### 1.6 Update Existing Obat Module

Update **resources/js/pages/obat/create.tsx** to include golongan fields:

```tsx
// Add to form data:
const { data, setData, post, processing, errors } = useForm({
    // ... existing fields
    golongan_obat: 'BEBAS',
    golongan_narkotika: undefined as string | undefined,
    golongan_psikotropika: undefined as string | undefined,
});

// Add to form:
<div>
    <Label htmlFor="golongan_obat">Golongan Obat</Label>
    <Select 
        value={data.golongan_obat} 
        onValueChange={(value) => setData('golongan_obat', value as any)}
    >
        <SelectTrigger>
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="BEBAS">Bebas (OTC)</SelectItem>
            <SelectItem value="BEBAS_TERBATAS">Bebas Terbatas</SelectItem>
            <SelectItem value="KERAS">Keras (Resep)</SelectItem>
            <SelectItem value="NARKOTIKA">Narkotika</SelectItem>
            <SelectItem value="PSIKOTROPIKA">Psikotropika</SelectItem>
        </SelectContent>
    </Select>
</div>

{data.golongan_obat === 'NARKOTIKA' && (
    <div>
        <Label>Golongan Narkotika</Label>
        <Select 
            value={data.golongan_narkotika} 
            onValueChange={(value) => setData('golongan_narkotika', value)}
        >
            <SelectContent>
                <SelectItem value="I">Golongan I</SelectItem>
                <SelectItem value="II">Golongan II</SelectItem>
                <SelectItem value="III">Golongan III</SelectItem>
            </SelectContent>
        </Select>
    </div>
)}

{data.golongan_obat === 'PSIKOTROPIKA' && (
    <div>
        <Label>Golongan Psikotropika</Label>
        <Select 
            value={data.golongan_psikotropika} 
            onValueChange={(value) => setData('golongan_psikotropika', value)}
        >
            <SelectContent>
                <SelectItem value="I">Golongan I</SelectItem>
                <SelectItem value="II">Golongan II</SelectItem>
                <SelectItem value="III">Golongan III</SelectItem>
                <SelectItem value="IV">Golongan IV</SelectItem>
            </SelectContent>
        </Select>
    </div>
)}
```

---

## 2. BPJS/JKN INTEGRATION

### Priority: CRITICAL (60% Market Coverage)
**Timeline**: 6-8 weeks
**Regulatory Basis**: Perpres 12/2013, Permenkes 71/2013

### 2.1 Overview

BPJS integration requires:
1. **Patient verification** via BPJS API
2. **Medicine availability check** (Formularium Nasional)
3. **Claim submission** (SEP - Surat Eligibilitas Peserta)
4. **Pricing** according to e-Catalogue
5. **Reporting** to P-Care BPJS

### 2.2 Database Schema

Create migration: `2026_02_11_000002_create_bpjs_integration_module.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // BPJS Patient data
        Schema::create('bpjs_peserta', function (Blueprint $table) {
            $table->id();
            $table->string('no_kartu', 20)->unique(); // BPJS card number
            $table->string('nik', 16)->unique(); // National ID
            $table->string('nama', 200);
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->date('tanggal_lahir');
            $table->text('alamat')->nullable();
            $table->string('no_hp', 15)->nullable();
            
            // BPJS specific
            $table->string('pisa', 50)->nullable(); // Provider code
            $table->string('kelas_rawat', 10); // 1, 2, 3
            $table->enum('jenis_peserta', ['PBI', 'NON_PBI']); // PBI = Government subsidy
            $table->string('provider_umum', 100)->nullable(); // Primary clinic
            $table->date('tmt_berlaku')->nullable(); // Valid from
            $table->date('tmt_akhir')->nullable(); // Valid until
            $table->enum('status_aktif', ['AKTIF', 'TIDAK_AKTIF'])->default('AKTIF');
            
            // Sync info
            $table->timestamp('last_verified_at')->nullable();
            $table->json('bpjs_response')->nullable(); // Store full API response
            
            $table->timestamps();
            
            $table->index('no_kartu');
            $table->index('nik');
        });

        // SEP (Surat Eligibilitas Peserta) - Claim document
        Schema::create('bpjs_sep', function (Blueprint $table) {
            $table->id();
            $table->string('no_sep', 50)->unique();
            $table->foreignId('peserta_id')->constrained('bpjs_peserta');
            
            $table->string('no_kartu', 20);
            $table->date('tgl_sep');
            $table->string('ppk_pelayanan', 50); // Healthcare facility code
            
            // Diagnosis
            $table->string('diagnosa_awal', 10); // ICD-10 code
            $table->string('diagnosa_awal_desc', 200);
            $table->string('poli_tujuan', 100);
            $table->enum('jenis_pelayanan', ['RAWAT_JALAN', 'RAWAT_INAP']);
            
            // Rujukan (referral)
            $table->string('no_rujukan', 50)->nullable();
            $table->date('tgl_rujukan')->nullable();
            $table->string('ppk_rujukan', 50)->nullable(); // Referring facility
            
            // Claim info
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'])
                  ->default('DRAFT');
            $table->decimal('total_klaim', 15, 2)->default(0);
            $table->text('catatan')->nullable();
            
            // Response from BPJS
            $table->json('bpjs_response')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // SEP Detail (medicines claimed)
        Schema::create('bpjs_sep_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sep_id')->constrained('bpjs_sep')->onDelete('cascade');
            $table->foreignId('obat_id')->constrained('obat');
            $table->foreignId('resep_detail_id')->nullable()->constrained('resep_detail');
            
            $table->string('kode_obat_bpjs', 50)->nullable(); // BPJS medicine code
            $table->integer('jumlah');
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('subtotal', 15, 2);
            
            $table->boolean('verifikasi_fornas')->default(false); // Checked against Fornas
            $table->boolean('sesuai_fornas')->default(true);
            $table->text('keterangan')->nullable();
            
            $table->timestamps();
        });

        // e-Catalogue prices (updated periodically from BPJS)
        Schema::create('bpjs_ecatalogue', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 50)->unique();
            $table->string('nama_obat', 200);
            $table->string('nama_generik', 200)->nullable();
            $table->string('satuan', 50);
            $table->string('kemasan', 100)->nullable();
            
            $table->decimal('harga_ecatalogue', 15, 2);
            $table->string('pabrik', 200)->nullable();
            $table->string('distributor', 200)->nullable();
            
            $table->boolean('aktif')->default(true);
            $table->date('berlaku_dari');
            $table->date('berlaku_sampai')->nullable();
            
            $table->foreignId('obat_id')->nullable()->constrained('obat'); // Map to internal obat
            
            $table->timestamps();
            
            $table->index('kode_obat');
        });

        // Formularium Nasional (National Formulary)
        Schema::create('bpjs_formularium_nasional', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 50)->unique();
            $table->string('nama_obat', 200);
            $table->string('nama_generik', 200);
            $table->string('bentuk_sediaan', 100);
            $table->string('kekuatan', 100);
            
            $table->boolean('fornas')->default(true); // In national formulary
            $table->string('kelas_terapi', 200)->nullable();
            $table->text('indikasi')->nullable();
            $table->text('dosis')->nullable();
            $table->text('perhatian')->nullable();
            
            $table->foreignId('obat_id')->nullable()->constrained('obat');
            
            $table->timestamps();
        });

        // P-Care claims (outpatient)
        Schema::create('bpjs_pcare_kunjungan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sep_id')->constrained('bpjs_sep');
            $table->string('no_kunjungan', 50)->unique();
            
            $table->date('tgl_kunjungan');
            $table->string('kode_provider', 50);
            $table->string('kode_poli', 50);
            
            $table->text('keluhan')->nullable();
            $table->string('tekanan_darah', 20)->nullable();
            $table->decimal('berat_badan', 5, 2)->nullable();
            $table->decimal('tinggi_badan', 5, 2)->nullable();
            
            $table->string('diagnosa_1', 10); // ICD-10
            $table->string('diagnosa_2', 10)->nullable();
            $table->string('diagnosa_3', 10)->nullable();
            
            $table->text('terapi')->nullable();
            $table->text('anjuran')->nullable();
            
            $table->enum('status_pulang', ['SEMBUH', 'RUJUK', 'KONTROL', 'MENINGGAL'])->nullable();
            
            $table->json('pcare_response')->nullable();
            $table->timestamp('synced_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bpjs_pcare_kunjungan');
        Schema::dropIfExists('bpjs_formularium_nasional');
        Schema::dropIfExists('bpjs_ecatalogue');
        Schema::dropIfExists('bpjs_sep_detail');
        Schema::dropIfExists('bpjs_sep');
        Schema::dropIfExists('bpjs_peserta');
    }
};
```

### 2.3 BPJS API Service

**app/Services/BpjsService.php**
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BpjsService
{
    private $consId;
    private $secretKey;
    private $baseUrl;
    private $userKey;

    public function __construct()
    {
        $this->consId = config('services.bpjs.cons_id');
        $this->secretKey = config('services.bpjs.secret_key');
        $this->baseUrl = config('services.bpjs.base_url');
        $this->userKey = config('services.bpjs.user_key');
    }

    /**
     * Generate signature for BPJS API
     */
    private function generateSignature($timestamp)
    {
        $data = $this->consId . '&' . $timestamp;
        $signature = hash_hmac('sha256', $data, $this->secretKey, true);
        return base64_encode($signature);
    }

    /**
     * Verify BPJS participant by card number
     */
    public function verifyPeserta($noKartu, $tglSep)
    {
        $timestamp = strval(time());
        $signature = $this->generateSignature($timestamp);
        
        $tglSepFormatted = date('Y-m-d', strtotime($tglSep));

        try {
            $response = Http::withHeaders([
                'X-cons-id' => $this->consId,
                'X-timestamp' => $timestamp,
                'X-signature' => $signature,
                'user_key' => $this->userKey,
            ])->get("{$this->baseUrl}/Peserta/nokartu/{$noKartu}/tglSEP/{$tglSepFormatted}");

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['response']) && $data['metaData']['code'] === '200') {
                    return [
                        'success' => true,
                        'data' => $data['response']['peserta'],
                    ];
                }
            }

            return [
                'success' => false,
                'message' => $response->json()['metaData']['message'] ?? 'Gagal verifikasi peserta',
            ];

        } catch (\Exception $e) {
            Log::error('BPJS Verify Peserta Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat verifikasi peserta',
            ];
        }
    }

    /**
     * Create SEP (Surat Eligibilitas Peserta)
     */
    public function createSep($data)
    {
        $timestamp = strval(time());
        $signature = $this->generateSignature($timestamp);

        $requestData = [
            'request' => [
                't_sep' => [
                    'noKartu' => $data['no_kartu'],
                    'tglSep' => $data['tgl_sep'],
                    'ppkPelayanan' => $data['ppk_pelayanan'],
                    'jnsPelayanan' => $data['jenis_pelayanan'], // 1=rawat inap, 2=rawat jalan
                    'klsRawat' => [
                        'klsRawatHak' => $data['kelas_rawat'],
                        'klsRawatNaik' => '',
                        'pembiayaan' => '',
                        'penanggungJawab' => '',
                    ],
                    'noMR' => $data['no_mr'] ?? '',
                    'rujukan' => [
                        'asalRujukan' => $data['asal_rujukan'] ?? '1', // 1=Faskes 1, 2=Faskes 2
                        'tglRujukan' => $data['tgl_rujukan'],
                        'noRujukan' => $data['no_rujukan'],
                        'ppkRujukan' => $data['ppk_rujukan'],
                    ],
                    'catatan' => $data['catatan'] ?? '',
                    'diagAwal' => $data['diagnosa_awal'],
                    'poli' => [
                        'tujuan' => $data['poli_tujuan'],
                        'eksekutif' => '0',
                    ],
                    'cob' => [
                        'cob' => '0',
                    ],
                    'katarak' => [
                        'katarak' => '0',
                    ],
                    'jaminan' => [
                        'lakaLantas' => '0',
                        'noLP' => '',
                        'penjamin' => [
                            'tglKejadian' => '',
                            'keterangan' => '',
                            'suplesi' => [
                                'suplesi' => '0',
                                'noSepSuplesi' => '',
                                'lokasiLaka' => [
                                    'kdPropinsi' => '',
                                    'kdKabupaten' => '',
                                    'kdKecamatan' => '',
                                ],
                            ],
                        ],
                    ],
                    'tujuanKunj' => '0', // 0=Normal, 1=Prosedur, 2=Konsul Dokter
                    'flagProcedure' => '',
                    'kdPenunjang' => '',
                    'assesmentPel' => '',
                    'skdp' => [
                        'noSurat' => '',
                        'kodeDPJP' => $data['kode_dpjp'] ?? '',
                    ],
                    'dpjpLayan' => $data['kode_dpjp'] ?? '',
                    'noTelp' => $data['no_telp'] ?? '',
                    'user' => auth()->user()->name,
                ],
            ],
        ];

        try {
            $response = Http::withHeaders([
                'X-cons-id' => $this->consId,
                'X-timestamp' => $timestamp,
                'X-signature' => $signature,
                'user_key' => $this->userKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/SEP/2.0/insert", $requestData);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['metaData']['code'] === '200') {
                    return [
                        'success' => true,
                        'data' => $result['response'],
                    ];
                }
            }

            return [
                'success' => false,
                'message' => $response->json()['metaData']['message'] ?? 'Gagal membuat SEP',
                'response' => $response->json(),
            ];

        } catch (\Exception $e) {
            Log::error('BPJS Create SEP Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat SEP',
            ];
        }
    }

    /**
     * Get medicine from e-Catalogue
     */
    public function getEcatalogue($kodeObat)
    {
        // Implementation to fetch from BPJS e-Catalogue API
        // Returns price and availability information
    }

    /**
     * Check if medicine is in Formularium Nasional
     */
    public function checkFormularium($kodeObat)
    {
        // Implementation to verify against Formularium Nasional
        // Returns boolean if medicine is covered by BPJS
    }

    /**
     * Submit P-Care kunjungan (outpatient visit)
     */
    public function submitPcareKunjungan($data)
    {
        // Implementation for P-Care submission
        // Required for outpatient pharmacy claims
    }
}
```

### 2.4 Configuration

**config/services.php** - Add BPJS configuration:
```php
'bpjs' => [
    'cons_id' => env('BPJS_CONS_ID'),
    'secret_key' => env('BPJS_SECRET_KEY'),
    'user_key' => env('BPJS_USER_KEY'),
    'base_url' => env('BPJS_BASE_URL', 'https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-dev'),
    'pcare_base_url' => env('BPJS_PCARE_BASE_URL', 'https://apijkn-dev.bpjs-kesehatan.go.id/pcare-rest-dev'),
],
```

**.env** - Add credentials:
```
BPJS_CONS_ID=your_consumer_id
BPJS_SECRET_KEY=your_secret_key
BPJS_USER_KEY=your_user_key
BPJS_BASE_URL=https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-dev
```

### 2.5 Controllers

**app/Http/Controllers/BpjsController.php**
```php
<?php

namespace App\Http\Controllers;

use App\Models\BpjsPeserta;
use App\Models\BpjsSep;
use App\Services\BpjsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BpjsController extends Controller
{
    protected $bpjsService;

    public function __construct(BpjsService $bpjsService)
    {
        $this->bpjsService = $bpjsService;
    }

    public function index()
    {
        $sep = BpjsSep::with(['peserta', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('bpjs/index', [
            'sep' => $sep,
        ]);
    }

    public function verifyPeserta(Request $request)
    {
        $validated = $request->validate([
            'no_kartu' => 'required|string|size:13',
            'tgl_sep' => 'required|date',
        ]);

        $result = $this->bpjsService->verifyPeserta(
            $validated['no_kartu'],
            $validated['tgl_sep']
        );

        if ($result['success']) {
            // Store or update peserta data
            $pesertaData = $result['data'];
            
            $peserta = BpjsPeserta::updateOrCreate(
                ['no_kartu' => $pesertaData['noKartu']],
                [
                    'nik' => $pesertaData['nik'] ?? '',
                    'nama' => $pesertaData['nama'],
                    'jenis_kelamin' => $pesertaData['sex'],
                    'tanggal_lahir' => $pesertaData['tglLahir'],
                    'pisa' => $pesertaData['pisa'] ?? null,
                    'kelas_rawat' => $pesertaData['hakKelas']['kode'] ?? '3',
                    'jenis_peserta' => $pesertaData['jenisPeserta']['keterangan'] === 'PBI' ? 'PBI' : 'NON_PBI',
                    'provider_umum' => $pesertaData['provUmum']['nmProvider'] ?? null,
                    'status_aktif' => $pesertaData['statusPeserta']['keterangan'] === 'AKTIF' ? 'AKTIF' : 'TIDAK_AKTIF',
                    'last_verified_at' => now(),
                    'bpjs_response' => $pesertaData,
                ]
            );

            return response()->json([
                'success' => true,
                'data' => $peserta,
            ]);
        }

        return response()->json($result, 400);
    }

    public function createSep(Request $request)
    {
        $validated = $request->validate([
            'peserta_id' => 'required|exists:bpjs_peserta,id',
            'tgl_sep' => 'required|date',
            'ppk_pelayanan' => 'required|string',
            'diagnosa_awal' => 'required|string|size:3', // ICD-10 code
            'poli_tujuan' => 'required|string',
            'jenis_pelayanan' => 'required|in:RAWAT_JALAN,RAWAT_INAP',
            'no_rujukan' => 'nullable|string',
            'tgl_rujukan' => 'nullable|date',
            'ppk_rujukan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $peserta = BpjsPeserta::findOrFail($validated['peserta_id']);

            // Call BPJS API to create SEP
            $sepData = [
                'no_kartu' => $peserta->no_kartu,
                'tgl_sep' => $validated['tgl_sep'],
                'ppk_pelayanan' => $validated['ppk_pelayanan'],
                'jenis_pelayanan' => $validated['jenis_pelayanan'] === 'RAWAT_JALAN' ? '2' : '1',
                'kelas_rawat' => $peserta->kelas_rawat,
                'diagnosa_awal' => $validated['diagnosa_awal'],
                'poli_tujuan' => $validated['poli_tujuan'],
                'no_rujukan' => $validated['no_rujukan'] ?? '',
                'tgl_rujukan' => $validated['tgl_rujukan'] ?? $validated['tgl_sep'],
                'ppk_rujukan' => $validated['ppk_rujukan'] ?? '',
            ];

            $result = $this->bpjsService->createSep($sepData);

            if ($result['success']) {
                $sep = BpjsSep::create([
                    'no_sep' => $result['data']['sep']['noSep'],
                    'peserta_id' => $peserta->id,
                    'no_kartu' => $peserta->no_kartu,
                    'tgl_sep' => $validated['tgl_sep'],
                    'ppk_pelayanan' => $validated['ppk_pelayanan'],
                    'diagnosa_awal' => $validated['diagnosa_awal'],
                    'diagnosa_awal_desc' => $result['data']['sep']['diagnosa'] ?? '',
                    'poli_tujuan' => $validated['poli_tujuan'],
                    'jenis_pelayanan' => $validated['jenis_pelayanan'],
                    'no_rujukan' => $validated['no_rujukan'],
                    'tgl_rujukan' => $validated['tgl_rujukan'],
                    'ppk_rujukan' => $validated['ppk_rujukan'],
                    'status' => 'APPROVED',
                    'bpjs_response' => $result['data'],
                    'submitted_at' => now(),
                    'approved_at' => now(),
                    'created_by' => auth()->id(),
                ]);

                DB::commit();

                return redirect()->route('bpjs.show', $sep->id)
                    ->with('success', 'SEP berhasil dibuat dengan nomor: ' . $sep->no_sep);
            }

            DB::rollBack();
            return back()->withErrors(['bpjs' => $result['message']]);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat SEP: ' . $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $sep = BpjsSep::with(['peserta', 'details.obat', 'createdBy'])->findOrFail($id);

        return Inertia::render('bpjs/show', [
            'sep' => $sep,
        ]);
    }
}
```

### 2.6 Frontend

**resources/js/pages/bpjs/index.tsx**
```tsx
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BpjsIndex({ sep }) {
    return (
        <AuthenticatedLayout>
            <Head title="BPJS / JKN" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>🏥 BPJS / JKN Integration</span>
                                <div className="flex gap-2">
                                    <Button onClick={() => router.get(route('bpjs.create'))}>
                                        Buat SEP Baru
                                    </Button>
                                    <Button variant="outline" onClick={() => router.get(route('bpjs.peserta'))}>
                                        Verifikasi Peserta
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* SEP list table */}
                            <div className="space-y-4">
                                {sep.data.map((item) => (
                                    <div key={item.id} className="border p-4 rounded">
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="font-bold">{item.no_sep}</div>
                                                <div className="text-sm text-gray-600">
                                                    {item.peserta.nama} - {item.no_kartu}
                                                </div>
                                                <div className="text-sm">
                                                    {item.tgl_sep} - {item.poli_tujuan}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge 
                                                    variant={
                                                        item.status === 'APPROVED' ? 'default' :
                                                        item.status === 'REJECTED' ? 'destructive' :
                                                        'secondary'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                                <div className="text-sm mt-2">
                                                    Rp {item.total_klaim.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => router.get(route('bpjs.show', item.id))}
                                            >
                                                Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## 3. FORMULARIUM MANAGEMENT

### Priority: CRITICAL (Hospital Requirement)
**Timeline**: 3-4 weeks
**Regulatory Basis**: Permenkes 72/2016 (KFT - Komite Farmasi dan Terapi)

### 3.1 Database Schema

Create migration: `2026_02_11_000003_create_formularium_management.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Hospital Formulary (approved medicine list)
        Schema::create('formularium', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obat_id')->constrained('obat');
            
            // Formulary info
            $table->string('kode_formularium', 50)->unique();
            $table->enum('status', ['AKTIF', 'NON_AKTIF', 'PENDING_REVIEW', 'DITOLAK'])
                  ->default('PENDING_REVIEW');
            
            // Usage restrictions
            $table->boolean('restricted')->default(false); // Requires special approval
            $table->text('restriction_notes')->nullable();
            $table->json('allowed_poli')->nullable(); // Which departments can prescribe
            $table->integer('max_quantity_per_prescription')->nullable();
            
            // Therapeutic info
            $table->string('therapeutic_class', 200)->nullable();
            $table->text('indication')->nullable();
            $table->text('contraindication')->nullable();
            $table->text('dosage_guidelines')->nullable();
            $table->text('special_notes')->nullable();
            
            // Alternative medicines
            $table->json('alternatives')->nullable(); // Array of obat_id for alternatives
            
            // KFT approval
            $table->foreignId('proposed_by')->nullable()->constrained('users');
            $table->timestamp('proposed_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            
            // Review schedule
            $table->date('next_review_date')->nullable();
            $table->integer('review_period_months')->default(12);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('status');
            $table->index('next_review_date');
        });

        // Formulary revision history
        Schema::create('formularium_revisi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formularium_id')->constrained('formularium')->onDelete('cascade');
            
            $table->integer('nomor_revisi');
            $table->date('tanggal_revisi');
            $table->string('jenis_perubahan', 100); // TAMBAH, HAPUS, MODIFIKASI, REVIEW
            $table->text('deskripsi_perubahan');
            $table->json('data_sebelum')->nullable();
            $table->json('data_sesudah')->nullable();
            
            $table->foreignId('direvisi_oleh')->constrained('users');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->timestamp('tanggal_persetujuan')->nullable();
            
            $table->timestamps();
        });

        // Formulary usage tracking
        Schema::create('formularium_penggunaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formularium_id')->constrained('formularium');
            $table->foreignId('resep_id')->constrained('resep');
            $table->foreignId('resep_detail_id')->constrained('resep_detail');
            
            $table->date('tanggal');
            $table->integer('jumlah');
            $table->string('poli', 100);
            $table->string('dokter_penulis', 200);
            
            // Compliance checks
            $table->boolean('sesuai_indikasi')->default(true);
            $table->boolean('sesuai_dosis')->default(true);
            $table->boolean('ada_approval')->nullable(); // For restricted medicines
            $table->text('catatan')->nullable();
            
            $table->timestamps();
            
            $table->index(['formularium_id', 'tanggal']);
        });

        // Non-formulary requests (medicines not in formulary)
        Schema::create('permintaan_non_formularium', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_permintaan', 50)->unique();
            
            $table->string('nama_obat', 200);
            $table->text('spesifikasi');
            $table->string('pabrik', 200)->nullable();
            $table->integer('jumlah_diminta');
            
            // Justification
            $table->text('alasan_permintaan');
            $table->text('justifikasi_medis');
            $table->json('bukti_klinis')->nullable(); // References, studies
            $table->boolean('tidak_ada_alternatif')->default(false);
            $table->text('alternatif_dicoba')->nullable();
            
            // Patient info
            $table->string('nama_pasien', 200);
            $table->string('no_rekam_medis', 50);
            $table->text('diagnosa');
            
            // Requesting info
            $table->foreignId('diminta_oleh')->constrained('users'); // Doctor
            $table->string('unit_peminta', 100);
            $table->date('tanggal_permintaan');
            $table->boolean('emergency')->default(false);
            
            // Approval workflow
            $table->enum('status', ['PENDING', 'APPROVED_APOTEKER', 'APPROVED_KFT', 'REJECTED', 'CANCELLED'])
                  ->default('PENDING');
            $table->foreignId('approved_apoteker_by')->nullable()->constrained('users');
            $table->timestamp('approved_apoteker_at')->nullable();
            $table->foreignId('approved_kft_by')->nullable()->constrained('users');
            $table->timestamp('approved_kft_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // If approved, add to formulary?
            $table->boolean('add_to_formulary')->default(false);
            $table->foreignId('formularium_id')->nullable()->constrained('formularium');
            
            $table->timestamps();
        });

        // KFT Meeting minutes
        Schema::create('kft_rapat', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_rapat', 50)->unique();
            $table->date('tanggal_rapat');
            $table->string('tempat', 200);
            
            $table->json('peserta'); // Array of user_id and names
            $table->foreignId('ketua_rapat')->constrained('users');
            $table->foreignId('notulen')->constrained('users');
            
            $table->text('agenda');
            $table->text('pembahasan')->nullable();
            $table->text('keputusan');
            $table->json('action_items')->nullable();
            
            $table->date('rapat_berikutnya')->nullable();
            $table->string('file_notulen')->nullable(); // PDF path
            
            $table->timestamps();
        });

        // Link formulary changes to KFT meetings
        Schema::create('kft_keputusan_formularium', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rapat_id')->constrained('kft_rapat');
            $table->foreignId('formularium_id')->nullable()->constrained('formularium');
            $table->foreignId('permintaan_non_formularium_id')->nullable()
                  ->constrained('permintaan_non_formularium');
            
            $table->enum('jenis_keputusan', [
                'TAMBAH_FORMULARIUM',
                'HAPUS_FORMULARIUM',
                'MODIFIKASI_FORMULARIUM',
                'APPROVAL_NON_FORMULARIUM',
                'REJECT_NON_FORMULARIUM',
            ]);
            $table->text('keputusan');
            $table->text('pertimbangan')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('kft_keputusan_formularium');
        Schema::dropIfExists('kft_rapat');
        Schema::dropIfExists('permintaan_non_formularium');
        Schema::dropIfExists('formularium_penggunaan');
        Schema::dropIfExists('formularium_revisi');
        Schema::dropIfExists('formularium');
    }
};
```

### 3.2 Models

**app/Models/Formularium.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formularium extends Model
{
    use SoftDeletes;

    protected $table = 'formularium';
    
    protected $fillable = [
        'obat_id', 'kode_formularium', 'status', 'restricted', 
        'restriction_notes', 'allowed_poli', 'max_quantity_per_prescription',
        'therapeutic_class', 'indication', 'contraindication', 
        'dosage_guidelines', 'special_notes', 'alternatives',
        'proposed_by', 'proposed_at', 'approved_by', 'approved_at', 
        'approval_notes', 'next_review_date', 'review_period_months'
    ];

    protected $casts = [
        'allowed_poli' => 'array',
        'alternatives' => 'array',
        'proposed_at' => 'datetime',
        'approved_at' => 'datetime',
        'next_review_date' => 'date',
        'restricted' => 'boolean',
    ];

    public function obat()
    {
        return $this->belongsTo(Obat::class);
    }

    public function proposedBy()
    {
        return $this->belongsTo(User::class, 'proposed_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function revisions()
    {
        return $this->hasMany(FormulariumRevisi::class);
    }

    public function usage()
    {
        return $this->hasMany(FormulariumPenggunaan::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'AKTIF');
    }

    public function scopeNeedsReview($query)
    {
        return $query->where('next_review_date', '<=', now()->addMonths(1));
    }
}
```

### 3.3 Controller

**app/Http/Controllers/FormulariumController.php**
```php
<?php

namespace App\Http/Controllers;

use App\Models\Formularium;
use App\Models/Obat;
use App\Models\PermintaanNonFormularium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FormulariumController extends Controller
{
    public function index(Request $request)
    {
        $query = Formularium::with(['obat.kategori', 'obat.jenisObat'])
            ->where('status', 'AKTIF')
            ->orderBy('kode_formularium');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('obat', function($q) use ($search) {
                $q->where('nama_obat', 'like', "%{$search}%")
                  ->orWhere('nama_generik', 'like', "%{$search}%");
            });
        }

        if ($request->filled('therapeutic_class')) {
            $query->where('therapeutic_class', $request->therapeutic_class);
        }

        if ($request->filled('restricted')) {
            $query->where('restricted', $request->restricted === 'true');
        }

        $formularium = $query->paginate(50);

        $needsReview = Formularium::needsReview()->count();

        return Inertia::render('formularium/index', [
            'formularium' => $formularium,
            'needsReview' => $needsReview,
            'filters' => $request->only(['search', 'therapeutic_class', 'restricted']),
        ]);
    }

    public function create()
    {
        $obat = Obat::whereNotIn('id', function($query) {
            $query->select('obat_id')->from('formularium')->where('status', 'AKTIF');
        })->get();

        return Inertia::render('formularium/create', [
            'obat' => $obat,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'obat_id' => 'required|exists:obat,id|unique:formularium,obat_id',
            'therapeutic_class' => 'required|string|max:200',
            'indication' => 'required|string',
            'contraindication' => 'nullable|string',
            'dosage_guidelines' => 'required|string',
            'special_notes' => 'nullable|string',
            'restricted' => 'boolean',
            'restriction_notes' => 'required_if:restricted,true',
            'allowed_poli' => 'nullable|array',
            'max_quantity_per_prescription' => 'nullable|integer|min:1',
            'alternatives' => 'nullable|array',
            'review_period_months' => 'required|integer|min:1|max:24',
        ]);

        DB::beginTransaction();
        try {
            $kodeFormularium = $this->generateKodeFormularium();

            $formularium = Formularium::create([
                'obat_id' => $validated['obat_id'],
                'kode_formularium' => $kodeFormularium,
                'status' => 'PENDING_REVIEW',
                'therapeutic_class' => $validated['therapeutic_class'],
                'indication' => $validated['indication'],
                'contraindication' => $validated['contraindication'] ?? null,
                'dosage_guidelines' => $validated['dosage_guidelines'],
                'special_notes' => $validated['special_notes'] ?? null,
                'restricted' => $validated['restricted'] ?? false,
                'restriction_notes' => $validated['restriction_notes'] ?? null,
                'allowed_poli' => $validated['allowed_poli'] ?? null,
                'max_quantity_per_prescription' => $validated['max_quantity_per_prescription'] ?? null,
                'alternatives' => $validated['alternatives'] ?? null,
                'proposed_by' => auth()->id(),
                'proposed_at' => now(),
                'review_period_months' => $validated['review_period_months'],
            ]);

            DB::commit();

            return redirect()->route('formularium.index')
                ->with('success', 'Obat berhasil diajukan ke formularium. Menunggu persetujuan KFT.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan ke formularium: ' . $e->getMessage()]);
        }
    }

    public function approve($id)
    {
        $formularium = Formularium::findOrFail($id);

        if ($formularium->status !== 'PENDING_REVIEW') {
            return back()->withErrors(['status' => 'Formularium sudah diproses']);
        }

        $formularium->update([
            'status' => 'AKTIF',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'next_review_date' => now()->addMonths($formularium->review_period_months),
        ]);

        return back()->with('success', 'Formularium berhasil disetujui');
    }

    // Request non-formulary medicine
    public function requestNonFormulary(Request $request)
    {
        $validated = $request->validate([
            'nama_obat' => 'required|string|max:200',
            'spesifikasi' => 'required|string',
            'pabrik' => 'nullable|string|max:200',
            'jumlah_diminta' => 'required|integer|min:1',
            'alasan_permintaan' => 'required|string',
            'justifikasi_medis' => 'required|string',
            'bukti_klinis' => 'nullable|array',
            'tidak_ada_alternatif' => 'boolean',
            'alternatif_dicoba' => 'required_if:tidak_ada_alternatif,true',
            'nama_pasien' => 'required|string|max:200',
            'no_rekam_medis' => 'required|string|max:50',
            'diagnosa' => 'required|string',
            'unit_peminta' => 'required|string|max:100',
            'emergency' => 'boolean',
        ]);

        $nomorPermintaan = $this->generateNomorPermintaan();

        $permintaan = PermintaanNonFormularium::create([
            'nomor_permintaan' => $nomorPermintaan,
            'nama_obat' => $validated['nama_obat'],
            'spesifikasi' => $validated['spesifikasi'],
            'pabrik' => $validated['pabrik'] ?? null,
            'jumlah_diminta' => $validated['jumlah_diminta'],
            'alasan_permintaan' => $validated['alasan_permintaan'],
            'justifikasi_medis' => $validated['justifikasi_medis'],
            'bukti_klinis' => $validated['bukti_klinis'] ?? null,
            'tidak_ada_alternatif' => $validated['tidak_ada_alternatif'] ?? false,
            'alternatif_dicoba' => $validated['alternatif_dicoba'] ?? null,
            'nama_pasien' => $validated['nama_pasien'],
            'no_rekam_medis' => $validated['no_rekam_medis'],
            'diagnosa' => $validated['diagnosa'],
            'diminta_oleh' => auth()->id(),
            'unit_peminta' => $validated['unit_peminta'],
            'tanggal_permintaan' => now(),
            'emergency' => $validated['emergency'] ?? false,
        ]);

        return redirect()->route('formularium.non-formulary.index')
            ->with('success', 'Permintaan non-formularium berhasil diajukan dengan nomor: ' . $nomorPermintaan);
    }

    private function generateKodeFormularium()
    {
        $year = date('Y');
        $count = Formularium::whereYear('created_at', $year)->count() + 1;
        return sprintf('FORM-%s-%04d', $year, $count);
    }

    private function generateNomorPermintaan()
    {
        $year = date('Y');
        $month = date('m');
        $count = PermintaanNonFormularium::whereYear('tanggal_permintaan', $year)
                                        ->whereMonth('tanggal_permintaan', $month)
                                        ->count() + 1;
        return sprintf('NFM-%s%s-%04d', $year, $month, $count);
    }
}
```

---

## 4. IMPLEMENTATION ROADMAP

### Phase 1: Narkotika Module (Weeks 1-6)
**Week 1-2**: Database setup
- Create migrations
- Create models
- Seed test data

**Week 3-4**: Backend logic
- Controllers implementation
- API integration prep
- Validation rules

**Week 5-6**: Frontend UI
- Buku Khusus interface
- Transaction forms
- Surat Pesanan module
- PDF export

### Phase 2: BPJS Integration (Weeks 7-14)
**Week 7-8**: BPJS API setup
- Register for BPJS API credentials
- Setup BpjsService
- Test API endpoints (use BPJS sandbox)

**Week 9-10**: Patient verification & SEP
- Peserta verification
- SEP creation
- Database integration

**Week 11-12**: e-Catalogue & Formularium Nasional
- Import e-Catalogue data
- Formularium Nasional sync
- Price mapping

**Week 13-14**: P-Care integration & testing
- Outpatient claim submission
- End-to-end testing
- Error handling

### Phase 3: Formularium Management (Weeks 15-18)
**Week 15**: Database & models
- Create formularium tables
- Setup relationships

**Week 16**: Backend logic
- Formularium CRUD
- Approval workflow
- Non-formulary requests

**Week 17**: Frontend interfaces
- Formularium list
- Request forms
- KFT meeting module

**Week 18**: Integration & testing
- Connect with prescription module
- Usage tracking
- Compliance checks

---

## 5. TESTING CHECKLIST

### Narkotika Module
- [ ] Can add narcotics to obat with proper golongan
- [ ] Incoming transactions update stock correctly
- [ ] Outgoing transactions require complete patient/doctor info
- [ ] Daily balance auto-calculates
- [ ] Surat Pesanan generates proper SP number
- [ ] PDF export matches legal format (Permenkes)
- [ ] Non-narcotics are blocked from special book

### BPJS Integration
- [ ] Participant verification returns correct data
- [ ] SEP creation succeeds with valid data
- [ ] Invalid BPJS card shows proper error
- [ ] e-Catalogue prices sync correctly
- [ ] Formularium Nasional verification works
- [ ] Claims calculate correct amounts
- [ ] P-Care submission successful

### Formularium Management
- [ ] New medicines can be proposed
- [ ] Approval workflow functions correctly
- [ ] Restricted medicines require approval
- [ ] Non-formulary requests route properly
- [ ] Usage tracking records all prescriptions
- [ ] Review alerts trigger before expiry
- [ ] KFT meetings link to decisions

---

## 6. REQUIRED EXTERNAL RESOURCES

### For BPJS Integration:
1. **BPJS API Credentials**
   - Register at: https://bpjs-kesehatan.go.id/
   - Request VClaim API access
   - Request P-Care API access
   - Process takes 2-4 weeks

2. **Documentation**
   - VClaim API Spec: Request from BPJS
   - P-Care API Spec: Request from BPJS
   - Formularium Nasional: Download from Kemkes

3. **Testing Environment**
   - BPJS provides sandbox environment
   - Test credentials provided by BPJS

### For Narkotika Module:
1. **Legal Compliance**
   - Consult with hospital legal team
   - Review Permenkes 3/2015 format requirements
   - Prepare for Dinkes inspection

2. **PDF Template**
   - Design Buku Khusus format according to regulation
   - Create Surat Pesanan template

### For Formularium:
1. **KFT Team**
   - Identify KFT members
   - Define approval workflow
   - Schedule regular meetings

2. **Initial Data**
   - Current hospital formulary list
   - Therapeutic classifications
   - Usage restrictions

---

## 7. DEPENDENCIES TO INSTALL

Add to `composer.json`:
```bash
composer require barryvdh/laravel-dompdf  # For PDF generation
composer require guzzlehttp/guzzle        # HTTP client for BPJS API
```

Add to `package.json`:
```bash
npm install signature_pad  # For digital signatures
npm install react-to-print  # For printing functionality
```

---

## 8. ESTIMATED COSTS

### Development Time:
- Narkotika Module: 6 weeks (1 developer)
- BPJS Integration: 8 weeks (1-2 developers)
- Formularium Management: 4 weeks (1 developer)
- **Total: 18 weeks ≈ 4.5 months**

### External Costs:
- BPJS API registration: Free (government service)
- PDF generation library: Free (open source)
- Testing & QA: 2-3 weeks additional

### Training:
- Admin training: 1 day per module
- Pharmacist training: 2 days (BPJS + Narkotika)
- Doctor training: 1 day (Formularium)

---

## 9. POST-IMPLEMENTATION

### After Narkotika Module:
- Submit to Dinkes for inspection approval
- Train all pharmacists on special book entry
- Schedule monthly audits

### After BPJS Integration:
- Apply for production API credentials
- Test with real patient data (controlled)
- Monitor claim success rate
- Setup daily sync schedules

### After Formularium:
- Schedule first KFT meeting
- Review and approve initial formulary
- Setup quarterly review schedule
- Train prescribers on restricted medicines

---

## CONCLUSION

These three modules will bring your system from **48/100** readiness to approximately **85-90/100** hospital readiness, making it suitable for:
- ✅ Small BPJS hospitals
- ✅ Non-teaching hospitals
- ✅ Hospital pharmacy departments
- ✅ Legal compliance with Indonesian regulations

**Priority Order:**
1. **Narkotika Module** (MUST HAVE - Legal requirement)
2. **BPJS Integration** (HIGH - 60% market coverage)
3. **Formularium Management** (HIGH - Hospital requirement)

Begin with Narkotika module as it's legally mandated and has the clearest requirements. BPJS integration is next for market coverage. Formularium management ties everything together for hospital pharmacy operations.
