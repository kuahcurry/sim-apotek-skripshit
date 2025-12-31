<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitRumahSakit extends Model
{
    use HasFactory;

    protected $table = 'unit_rumah_sakit';

    protected $fillable = [
        'nama_unit',
        'kode_unit',
        'penanggung_jawab',
        'no_telepon',
        'lokasi',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all transactions to this unit
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'unit_id');
    }

    /**
     * Get all medicine requests from this unit
     */
    public function permintaan(): HasMany
    {
        return $this->hasMany(PermintaanUnit::class, 'unit_id');
    }

    /**
     * Scope for active units
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
