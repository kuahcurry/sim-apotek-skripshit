<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class StokOpname extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'stok_opname';

    const STATUS_DRAFT = 'draft';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_APPROVED = 'approved';

    protected $fillable = [
        'nomor_opname',
        'tanggal_opname',
        'penanggung_jawab',
        'unit_id',
        'status',
        'approved_by',
        'approved_at',
        'catatan',
        'berita_acara',
    ];

    protected $casts = [
        'tanggal_opname' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($opname) {
            if (empty($opname->nomor_opname)) {
                $opname->nomor_opname = $opname->generateNomorOpname();
            }
        });
    }

    /**
     * Generate unique stock opname number
     */
    public function generateNomorOpname(): string
    {
        $prefix = 'SO';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get the responsible user (Apoteker PJ)
     */
    public function penanggungJawab(): BelongsTo
    {
        return $this->belongsTo(User::class, 'penanggung_jawab');
    }

    /**
     * Get the approving user
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the hospital unit
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitRumahSakit::class, 'unit_id');
    }

    /**
     * Get stock opname details
     */
    public function details(): HasMany
    {
        return $this->hasMany(StokOpnameDetail::class, 'stok_opname_id');
    }

    /**
     * Calculate total discrepancy
     */
    public function getTotalSelisihAttribute(): int
    {
        return $this->details->sum('selisih');
    }

    /**
     * Approve stock opname
     */
    public function approve(User $user): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        // Apply adjustments to actual stock
        foreach ($this->details as $detail) {
            if ($detail->selisih != 0) {
                $batch = $detail->batch;
                $batch->stok_tersedia = $detail->stok_fisik;
                $batch->save();

                // Recalculate medicine total stock
                $batch->obat->recalculateStok();
            }
        }
    }

    /**
     * Scope for pending approval
     */
    public function scopePendingApproval($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }
}
