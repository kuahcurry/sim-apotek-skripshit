<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'supplier';

    protected $fillable = [
        'kode_supplier',
        'nama_supplier',
        'alamat',
        'no_telepon',
        'email',
        'kontak_person',
        'no_hp_kontak',
        'npwp',
        'status',
        'catatan',
    ];

    /**
     * Get all batches from this supplier
     */
    public function batches(): HasMany
    {
        return $this->hasMany(BatchObat::class, 'supplier_id');
    }

    /**
     * Scope for active suppliers
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
