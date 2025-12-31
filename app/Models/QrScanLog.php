<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrScanLog extends Model
{
    use HasFactory;

    protected $table = 'qr_scan_log';

    const METODE_CAMERA = 'camera';
    const METODE_SCANNER = 'scanner';

    const HASIL_SUCCESS = 'success';
    const HASIL_NOT_FOUND = 'not_found';
    const HASIL_EXPIRED = 'expired';
    const HASIL_ERROR = 'error';

    protected $fillable = [
        'batch_id',
        'user_id',
        'kode_qr_scanned',
        'metode_scan',
        'hasil_scan',
        'pesan_error',
        'data_hasil',
        'ip_address',
        'user_agent',
        'waktu_scan',
    ];

    protected $casts = [
        'data_hasil' => 'array',
        'waktu_scan' => 'datetime',
    ];

    /**
     * Get the batch that was scanned
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(BatchObat::class, 'batch_id');
    }

    /**
     * Get the user who scanned
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Create a scan log entry
     */
    public static function logScan(
        string $kodeQr,
        string $metode,
        string $hasil,
        BatchObat $batch = null,
        User $user = null,
        string $pesanError = null,
        array $dataHasil = null
    ): self {
        return self::create([
            'batch_id' => $batch?->id,
            'user_id' => $user?->id ?? auth()->id(),
            'kode_qr_scanned' => $kodeQr,
            'metode_scan' => $metode,
            'hasil_scan' => $hasil,
            'pesan_error' => $pesanError,
            'data_hasil' => $dataHasil,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'waktu_scan' => now(),
        ]);
    }

    /**
     * Scope for successful scans
     */
    public function scopeSuccess($query)
    {
        return $query->where('hasil_scan', self::HASIL_SUCCESS);
    }

    /**
     * Scope for failed scans
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('hasil_scan', [self::HASIL_NOT_FOUND, self::HASIL_EXPIRED, self::HASIL_ERROR]);
    }

    /**
     * Scope by scan method
     */
    public function scopeByMetode($query, string $metode)
    {
        return $query->where('metode_scan', $metode);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('waktu_scan', [$startDate, $endDate]);
    }

    /**
     * Check if scan was successful
     */
    public function isSuccess(): bool
    {
        return $this->hasil_scan === self::HASIL_SUCCESS;
    }
}
