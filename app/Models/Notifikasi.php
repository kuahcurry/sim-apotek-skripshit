<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table = 'notifikasi';

    const TIPE_INFO = 'info';
    const TIPE_WARNING = 'warning';
    const TIPE_DANGER = 'danger';
    const TIPE_SUCCESS = 'success';

    const KATEGORI_STOK_RENDAH = 'stok_rendah';
    const KATEGORI_EXPIRED_SOON = 'expired_soon';
    const KATEGORI_EXPIRED = 'expired';
    const KATEGORI_PERMINTAAN_BARU = 'permintaan_baru';
    const KATEGORI_SISTEM = 'sistem';
    const KATEGORI_LAINNYA = 'lainnya';

    protected $fillable = [
        'user_id',
        'judul',
        'pesan',
        'tipe',
        'kategori',
        'notifiable_type',
        'notifiable_id',
        'link',
        'is_read',
        'read_at',
        'is_email_sent',
        'email_sent_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
    ];

    /**
     * Get the user this notification belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the related model (polymorphic)
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Create a notification
     */
    public static function notify(
        string $judul,
        string $pesan,
        string $tipe = self::TIPE_INFO,
        string $kategori = self::KATEGORI_LAINNYA,
        User $user = null,
        Model $model = null,
        string $link = null
    ): self {
        return self::create([
            'user_id' => $user?->id,
            'judul' => $judul,
            'pesan' => $pesan,
            'tipe' => $tipe,
            'kategori' => $kategori,
            'notifiable_type' => $model ? get_class($model) : null,
            'notifiable_id' => $model?->id,
            'link' => $link,
        ]);
    }

    /**
     * Create a low stock notification
     */
    public static function notifyStokRendah(Obat $obat, User $user = null): self
    {
        return self::notify(
            judul: 'Stok Rendah',
            pesan: "Stok {$obat->nama_obat} sudah mencapai batas minimum ({$obat->stok_total}/{$obat->stok_minimum})",
            tipe: self::TIPE_WARNING,
            kategori: self::KATEGORI_STOK_RENDAH,
            user: $user,
            model: $obat,
            link: "/obat/{$obat->id}"
        );
    }

    /**
     * Create an expiring soon notification
     */
    public static function notifyExpiringSoon(BatchObat $batch, User $user = null): self
    {
        $obat = $batch->obat;
        return self::notify(
            judul: 'Obat Akan Kadaluarsa',
            pesan: "{$obat->nama_obat} (Batch: {$batch->nomor_batch}) akan kadaluarsa pada {$batch->tanggal_expired->format('d M Y')}",
            tipe: self::TIPE_WARNING,
            kategori: self::KATEGORI_EXPIRED_SOON,
            user: $user,
            model: $batch,
            link: "/obat/{$obat->id}/batch/{$batch->id}"
        );
    }

    /**
     * Create an expired notification
     */
    public static function notifyExpired(BatchObat $batch, User $user = null): self
    {
        $obat = $batch->obat;
        return self::notify(
            judul: 'Obat Kadaluarsa',
            pesan: "{$obat->nama_obat} (Batch: {$batch->nomor_batch}) sudah kadaluarsa!",
            tipe: self::TIPE_DANGER,
            kategori: self::KATEGORI_EXPIRED,
            user: $user,
            model: $batch,
            link: "/obat/{$obat->id}/batch/{$batch->id}"
        );
    }

    /**
     * Create a new request notification
     */
    public static function notifyPermintaanBaru(PermintaanUnit $permintaan, User $user = null): self
    {
        return self::notify(
            judul: 'Permintaan Obat Baru',
            pesan: "{$permintaan->unit->nama_unit} meminta {$permintaan->jumlah_diminta} {$permintaan->obat->nama_obat}",
            tipe: $permintaan->isUrgent() ? self::TIPE_DANGER : self::TIPE_INFO,
            kategori: self::KATEGORI_PERMINTAAN_BARU,
            user: $user,
            model: $permintaan,
            link: "/permintaan/{$permintaan->id}"
        );
    }

    /**
     * Mark as read
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for specific user
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId)->orWhereNull('user_id');
    }

    /**
     * Scope for specific category
     */
    public function scopeKategori($query, string $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    /**
     * Scope for recent notifications
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
