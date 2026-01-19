<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PemusnahanObat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pemusnahan_obat';

    const STATUS_DRAFT = 'draft';
    const STATUS_COMPLETED = 'completed';
    const STATUS_APPROVED = 'approved';

    const ALASAN_EXPIRED = 'expired';
    const ALASAN_RUSAK = 'rusak';
    const ALASAN_RECALL = 'recall';
    const ALASAN_LAINNYA = 'lainnya';

    protected $fillable = [
        'nomor_berita_acara',
        'tanggal_pemusnahan',
        'penanggung_jawab',
        'lokasi_pemusnahan',
        'metode_pemusnahan',
        'saksi',
        'alasan',
        'keterangan',
        'file_berita_acara',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'tanggal_pemusnahan' => 'date',
        'saksi' => 'array',
        'approved_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pemusnahan) {
            if (empty($pemusnahan->nomor_berita_acara)) {
                $pemusnahan->nomor_berita_acara = $pemusnahan->generateNomorBA();
            }
        });
    }

    /**
     * Generate unique destruction report number
     */
    public function generateNomorBA(): string
    {
        $prefix = 'BA-MUSNAHKAN';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get the responsible user
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
     * Get destruction details
     */
    public function details(): HasMany
    {
        return $this->hasMany(PemusnahanObatDetail::class, 'pemusnahan_id');
    }

    /**
     * Calculate total value destroyed
     */
    public function getTotalNilaiAttribute(): float
    {
        return $this->details->sum('nilai_perolehan');
    }

    /**
     * Approve destruction
     */
    public function approve(User $user): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        // Update batch status and stock
        foreach ($this->details as $detail) {
            $batch = $detail->batch;
            $batch->stok_tersedia -= $detail->jumlah;
            
            if ($batch->stok_tersedia <= 0) {
                $batch->status = 'empty';
            }
            
            $batch->save();

            // Recalculate medicine stock
            $batch->obat->recalculateStok();
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
