<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SatuanObat extends Model
{
    use HasFactory;

    protected $table = 'satuan_obat';

    protected $fillable = [
        'nama_satuan',
        'singkatan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all medicines with this unit
     */
    public function obat(): HasMany
    {
        return $this->hasMany(Obat::class, 'satuan_id');
    }

    /**
     * Scope for active units
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
