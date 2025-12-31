<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LogAktivitas extends Model
{
    use HasFactory;

    protected $table = 'log_aktivitas';

    const AKSI_CREATE = 'create';
    const AKSI_UPDATE = 'update';
    const AKSI_DELETE = 'delete';
    const AKSI_VIEW = 'view';
    const AKSI_LOGIN = 'login';
    const AKSI_LOGOUT = 'logout';
    const AKSI_SCAN = 'scan';

    protected $fillable = [
        'user_id',
        'aktivitas',
        'modul',
        'aksi',
        'loggable_type',
        'loggable_id',
        'data_lama',
        'data_baru',
        'ip_address',
        'user_agent',
        'waktu',
    ];

    protected $casts = [
        'data_lama' => 'array',
        'data_baru' => 'array',
        'waktu' => 'datetime',
    ];

    /**
     * Get the user who performed this activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the related model (polymorphic)
     */
    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Create a log entry
     */
    public static function log(
        User $user,
        string $aktivitas,
        string $modul = null,
        string $aksi = null,
        Model $model = null,
        array $dataLama = null,
        array $dataBaru = null
    ): self {
        return self::create([
            'user_id' => $user->id,
            'aktivitas' => $aktivitas,
            'modul' => $modul,
            'aksi' => $aksi,
            'loggable_type' => $model ? get_class($model) : null,
            'loggable_id' => $model?->id,
            'data_lama' => $dataLama,
            'data_baru' => $dataBaru,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'waktu' => now(),
        ]);
    }

    /**
     * Scope for specific module
     */
    public function scopeModul($query, string $modul)
    {
        return $query->where('modul', $modul);
    }

    /**
     * Scope for specific action
     */
    public function scopeAksi($query, string $aksi)
    {
        return $query->where('aksi', $aksi);
    }

    /**
     * Scope for specific user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('waktu', [$startDate, $endDate]);
    }

    /**
     * Scope for today
     */
    public function scopeToday($query)
    {
        return $query->whereDate('waktu', now()->toDateString());
    }
}
