<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokOpnameDetail extends Model
{
    use HasFactory;

    protected $table = 'stok_opname_detail';

    protected $fillable = [
        'stok_opname_id',
        'batch_id',
        'stok_sistem',
        'stok_fisik',
        'selisih',
        'keterangan_selisih',
    ];

    protected $casts = [
        'stok_sistem' => 'integer',
        'stok_fisik' => 'integer',
        'selisih' => 'integer',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($detail) {
            $detail->selisih = $detail->stok_fisik - $detail->stok_sistem;
        });

        static::updating(function ($detail) {
            $detail->selisih = $detail->stok_fisik - $detail->stok_sistem;
        });
    }

    /**
     * Get the stock opname
     */
    public function stokOpname(): BelongsTo
    {
        return $this->belongsTo(StokOpname::class, 'stok_opname_id');
    }

    /**
     * Get the batch
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(BatchObat::class, 'batch_id');
    }

    /**
     * Check if has discrepancy
     */
    public function hasDiscrepancy(): bool
    {
        return $this->selisih != 0;
    }
}
