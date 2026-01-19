<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PemusnahanObatDetail extends Model
{
    use HasFactory;

    protected $table = 'pemusnahan_obat_detail';

    protected $fillable = [
        'pemusnahan_id',
        'batch_id',
        'jumlah',
        'nilai_perolehan',
        'kondisi',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'nilai_perolehan' => 'decimal:2',
    ];

    /**
     * Get the destruction record
     */
    public function pemusnahan(): BelongsTo
    {
        return $this->belongsTo(PemusnahanObat::class, 'pemusnahan_id');
    }

    /**
     * Get the batch
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(BatchObat::class, 'batch_id');
    }
}
