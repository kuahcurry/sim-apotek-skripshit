<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BatchObat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'batch_obat';

    protected $fillable = [
        'obat_id',
        'nomor_batch',
        'tanggal_produksi',
        'tanggal_expired',
        'tanggal_masuk',
        'stok_awal',
        'stok_tersedia',
        'harga_beli',
        'kode_qr',
        'qr_data',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_produksi' => 'date',
        'tanggal_expired' => 'date',
        'tanggal_masuk' => 'date',
        'stok_awal' => 'integer',
        'stok_tersedia' => 'integer',
        'harga_beli' => 'decimal:2',
        'qr_data' => 'array',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($batch) {
            if (empty($batch->kode_qr)) {
                $batch->kode_qr = $batch->generateQrCode();
            }
            $batch->qr_data = $batch->generateQrData();
        });

        static::updating(function ($batch) {
            // Update QR data when batch info changes
            $batch->qr_data = $batch->generateQrData();
        });
    }

    /**
     * Get the medicine this batch belongs to
     */
    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class, 'obat_id');
    }

    /**
     * Get all transactions for this batch
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'batch_id');
    }

    /**
     * Get QR scan logs
     */
    public function qrScanLogs(): HasMany
    {
        return $this->hasMany(QrScanLog::class, 'batch_id');
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
     * Generate unique QR code
     */
    public function generateQrCode(): string
    {
        $prefix = 'BATCH';
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(Str::random(6));
        return "{$prefix}-{$timestamp}-{$random}";
    }

    /**
     * Generate QR data for encoding
     */
    public function generateQrData(): array
    {
        $obat = $this->obat;
        
        return [
            'kode_qr' => $this->kode_qr,
            'obat' => [
                'id' => $obat?->id,
                'kode' => $obat?->kode_obat,
                'nama' => $obat?->nama_obat,
                'nama_generik' => $obat?->nama_generik,
                'kategori' => $obat?->kategori?->nama_kategori,
                'jenis' => $obat?->jenis?->nama_jenis,
                'satuan' => $obat?->satuan?->nama_satuan,
            ],
            'batch' => [
                'id' => $this->id,
                'nomor' => $this->nomor_batch,
                'expired' => $this->tanggal_expired?->format('Y-m-d'),
                'stok' => $this->stok_tersedia,
            ],
            'generated_at' => now()->toIso8601String(),
            'link' => url("/obat/{$obat?->id}/batch/{$this->id}"),
        ];
    }

    /**
     * Get QR data as JSON string for QR generation
     */
    public function getQrJsonAttribute(): string
    {
        return json_encode($this->qr_data);
    }

    /**
     * Check if batch is expired
     */
    public function isExpired(): bool
    {
        return $this->tanggal_expired->isPast();
    }

    /**
     * Check if batch will expire soon (within 30 days)
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->tanggal_expired->isBetween(now(), now()->addDays($days));
    }

    /**
     * Get days until expiry
     */
    public function getDaysUntilExpiryAttribute(): int
    {
        return now()->diffInDays($this->tanggal_expired, false);
    }

    /**
     * Scope for active batches
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for expiring soon
     */
    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('status', 'active')
            ->whereBetween('tanggal_expired', [now(), now()->addDays($days)]);
    }

    /**
     * Scope for expired batches
     */
    public function scopeExpired($query)
    {
        return $query->where('tanggal_expired', '<', now());
    }

    /**
     * Scope FEFO ordering
     */
    public function scopeFefo($query)
    {
        return $query->orderBy('tanggal_expired', 'asc');
    }
}
