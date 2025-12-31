<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Obat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'obat';

    protected $fillable = [
        'kode_obat',
        'nama_obat',
        'nama_generik',
        'nama_brand',
        'kategori_id',
        'jenis_id',
        'satuan_id',
        'stok_total',
        'stok_minimum',
        'harga_beli',
        'harga_jual',
        'lokasi_penyimpanan',
        'deskripsi',
        'efek_samping',
        'indikasi',
        'kontraindikasi',
        'gambar',
        'is_active',
    ];

    protected $casts = [
        'stok_total' => 'integer',
        'stok_minimum' => 'integer',
        'harga_beli' => 'decimal:2',
        'harga_jual' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category of this medicine
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriObat::class, 'kategori_id');
    }

    /**
     * Get the type/form of this medicine
     */
    public function jenis(): BelongsTo
    {
        return $this->belongsTo(JenisObat::class, 'jenis_id');
    }

    /**
     * Get the unit of this medicine
     */
    public function satuan(): BelongsTo
    {
        return $this->belongsTo(SatuanObat::class, 'satuan_id');
    }

    /**
     * Get all batches of this medicine
     */
    public function batches(): HasMany
    {
        return $this->hasMany(BatchObat::class, 'obat_id');
    }

    /**
     * Get active batches ordered by FEFO (First Expired First Out)
     */
    public function activeBatches(): HasMany
    {
        return $this->hasMany(BatchObat::class, 'obat_id')
            ->where('status', 'active')
            ->where('stok_tersedia', '>', 0)
            ->orderBy('tanggal_expired', 'asc');
    }

    /**
     * Get all transactions for this medicine
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'obat_id');
    }

    /**
     * Get all unit requests for this medicine
     */
    public function permintaan(): HasMany
    {
        return $this->hasMany(PermintaanUnit::class, 'obat_id');
    }

    /**
     * Get activity logs
     */
    public function logAktivitas(): MorphMany
    {
        return $this->morphMany(LogAktivitas::class, 'loggable');
    }

    /**
     * Get notifications
     */
    public function notifikasi(): MorphMany
    {
        return $this->morphMany(Notifikasi::class, 'notifiable');
    }

    /**
     * Scope for active medicines
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for low stock medicines
     */
    public function scopeStokRendah($query)
    {
        return $query->whereColumn('stok_total', '<=', 'stok_minimum');
    }

    /**
     * Check if stock is low
     */
    public function isStokRendah(): bool
    {
        return $this->stok_total <= $this->stok_minimum;
    }

    /**
     * Recalculate total stock from batches
     */
    public function recalculateStok(): void
    {
        $this->stok_total = $this->batches()
            ->where('status', 'active')
            ->sum('stok_tersedia');
        $this->save();
    }

    /**
     * Get next batch by FEFO
     */
    public function getNextBatchFefo(): ?BatchObat
    {
        return $this->activeBatches()->first();
    }
}
