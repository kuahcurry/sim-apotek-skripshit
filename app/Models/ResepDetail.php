<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResepDetail extends Model
{
    use HasFactory;

    protected $table = 'resep_detail';

    protected $fillable = [
        'resep_id',
        'obat_id',
        'jumlah',
        'dosis',
        'aturan_pakai',
        'catatan',
        'is_dispensed',
    ];

    protected $casts = [
        'is_dispensed' => 'boolean',
    ];

    /**
     * Get the prescription
     */
    public function resep(): BelongsTo
    {
        return $this->belongsTo(Resep::class, 'resep_id');
    }

    /**
     * Get the medicine
     */
    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class, 'obat_id');
    }

    /**
     * Mark as dispensed
     */
    public function markAsDispensed(): void
    {
        $this->update(['is_dispensed' => true]);
    }
}
