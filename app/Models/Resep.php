<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Resep extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'resep';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSED = 'processed';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'nomor_resep',
        'nomor_rm',
        'nama_pasien',
        'nama_dokter',
        'unit_id',
        'tanggal_resep',
        'jenis_pasien',
        'cara_bayar',
        'status',
        'processed_by',
        'processed_at',
        'catatan',
    ];

    protected $casts = [
        'tanggal_resep' => 'date',
        'processed_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($resep) {
            if (empty($resep->nomor_resep)) {
                $resep->nomor_resep = $resep->generateNomorResep();
            }
        });
    }

    /**
     * Generate unique prescription number
     */
    public function generateNomorResep(): string
    {
        $prefix = 'RSP';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get the hospital unit
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitRumahSakit::class, 'unit_id');
    }

    /**
     * Get the user who processed this prescription
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get prescription details
     */
    public function details(): HasMany
    {
        return $this->hasMany(ResepDetail::class, 'resep_id');
    }

    /**
     * Get transaction for this prescription
     */
    public function transaksi(): HasOne
    {
        return $this->hasOne(Transaksi::class, 'resep_id');
    }

    /**
     * Check if pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if all items are dispensed
     */
    public function isFullyDispensed(): bool
    {
        return $this->details()->where('is_dispensed', false)->count() === 0;
    }

    /**
     * Scope for pending prescriptions
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}
