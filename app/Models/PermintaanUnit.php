<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PermintaanUnit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'permintaan_unit';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSED = 'processed';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const PRIORITAS_NORMAL = 'normal';
    const PRIORITAS_URGENT = 'urgent';
    const PRIORITAS_EMERGENCY = 'emergency';

    protected $fillable = [
        'kode_permintaan',
        'unit_id',
        'obat_id',
        'jumlah_diminta',
        'jumlah_disetujui',
        'tanggal_permintaan',
        'status',
        'prioritas',
        'catatan',
        'catatan_farmasi',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'jumlah_diminta' => 'integer',
        'jumlah_disetujui' => 'integer',
        'tanggal_permintaan' => 'date',
        'processed_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($permintaan) {
            if (empty($permintaan->kode_permintaan)) {
                $permintaan->kode_permintaan = $permintaan->generateKodePermintaan();
            }
            if (empty($permintaan->tanggal_permintaan)) {
                $permintaan->tanggal_permintaan = now()->toDateString();
            }
        });
    }

    /**
     * Generate unique request code
     */
    public function generateKodePermintaan(): string
    {
        $prefix = 'REQ';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get the requesting unit
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitRumahSakit::class, 'unit_id');
    }

    /**
     * Get the requested medicine
     */
    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class, 'obat_id');
    }

    /**
     * Get the user who processed this request
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
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
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for processed requests
     */
    public function scopeProcessed($query)
    {
        return $query->where('status', self::STATUS_PROCESSED);
    }

    /**
     * Scope for completed requests
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for urgent/emergency requests
     */
    public function scopeUrgent($query)
    {
        return $query->whereIn('prioritas', [self::PRIORITAS_URGENT, self::PRIORITAS_EMERGENCY]);
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request is urgent
     */
    public function isUrgent(): bool
    {
        return in_array($this->prioritas, [self::PRIORITAS_URGENT, self::PRIORITAS_EMERGENCY]);
    }

    /**
     * Mark as processed
     */
    public function markAsProcessed(User $user, int $jumlahDisetujui = null, string $catatan = null): void
    {
        $this->update([
            'status' => self::STATUS_PROCESSED,
            'jumlah_disetujui' => $jumlahDisetujui ?? $this->jumlah_diminta,
            'catatan_farmasi' => $catatan,
            'processed_by' => $user->id,
            'processed_at' => now(),
        ]);
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Mark as cancelled
     */
    public function markAsCancelled(string $alasan = null): void
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'catatan_farmasi' => $alasan,
        ]);
    }
}
