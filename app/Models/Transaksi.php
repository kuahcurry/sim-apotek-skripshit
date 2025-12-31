<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Transaksi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'transaksi';

    const JENIS_MASUK = 'masuk';
    const JENIS_KELUAR = 'keluar';
    const JENIS_PENJUALAN = 'penjualan';

    protected $fillable = [
        'kode_transaksi',
        'obat_id',
        'batch_id',
        'user_id',
        'unit_id',
        'jenis_transaksi',
        'jumlah',
        'harga_satuan',
        'total_harga',
        'tanggal_transaksi',
        'waktu_transaksi',
        'keterangan',
        'nomor_referensi',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'harga_satuan' => 'decimal:2',
        'total_harga' => 'decimal:2',
        'tanggal_transaksi' => 'date',
        'waktu_transaksi' => 'datetime:H:i:s',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaksi) {
            if (empty($transaksi->kode_transaksi)) {
                $transaksi->kode_transaksi = $transaksi->generateKodeTransaksi();
            }
            if (empty($transaksi->tanggal_transaksi)) {
                $transaksi->tanggal_transaksi = now()->toDateString();
            }
            if (empty($transaksi->waktu_transaksi)) {
                $transaksi->waktu_transaksi = now()->toTimeString();
            }
        });
    }

    /**
     * Generate unique transaction code
     */
    public function generateKodeTransaksi(): string
    {
        $prefix = match($this->jenis_transaksi) {
            self::JENIS_MASUK => 'TRM',      // Transaksi Masuk
            self::JENIS_KELUAR => 'TRK',     // Transaksi Keluar
            self::JENIS_PENJUALAN => 'TRJ',  // Transaksi Jual
            default => 'TRX',
        };
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get the medicine for this transaction
     */
    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class, 'obat_id');
    }

    /**
     * Get the batch for this transaction
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(BatchObat::class, 'batch_id');
    }

    /**
     * Get the user who made this transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the hospital unit for this transaction
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitRumahSakit::class, 'unit_id');
    }

    /**
     * Get activity logs
     */
    public function logAktivitas(): MorphMany
    {
        return $this->morphMany(LogAktivitas::class, 'loggable');
    }

    /**
     * Scope for incoming transactions
     */
    public function scopeMasuk($query)
    {
        return $query->where('jenis_transaksi', self::JENIS_MASUK);
    }

    /**
     * Scope for outgoing transactions
     */
    public function scopeKeluar($query)
    {
        return $query->where('jenis_transaksi', self::JENIS_KELUAR);
    }

    /**
     * Scope for sales transactions
     */
    public function scopePenjualan($query)
    {
        return $query->where('jenis_transaksi', self::JENIS_PENJUALAN);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_transaksi', [$startDate, $endDate]);
    }

    /**
     * Scope for today's transactions
     */
    public function scopeToday($query)
    {
        return $query->whereDate('tanggal_transaksi', now()->toDateString());
    }

    /**
     * Scope for this month's transactions
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('tanggal_transaksi', now()->month)
            ->whereYear('tanggal_transaksi', now()->year);
    }

    /**
     * Check if this is incoming transaction
     */
    public function isMasuk(): bool
    {
        return $this->jenis_transaksi === self::JENIS_MASUK;
    }

    /**
     * Check if this is outgoing transaction
     */
    public function isKeluar(): bool
    {
        return $this->jenis_transaksi === self::JENIS_KELUAR;
    }

    /**
     * Check if this is sales transaction
     */
    public function isPenjualan(): bool
    {
        return $this->jenis_transaksi === self::JENIS_PENJUALAN;
    }
}
