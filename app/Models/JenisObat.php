<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisObat extends Model
{
    use HasFactory;

    protected $table = 'jenis_obat';

    protected $fillable = [
        'nama_jenis',
        'deskripsi',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all medicines of this type
     */
    public function obat(): HasMany
    {
        return $this->hasMany(Obat::class, 'jenis_id');
    }

    /**
     * Scope for active types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
