<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    const ROLE_ADMIN = 'admin';
    const ROLE_PHARMACIST = 'pharmacist';
    const ROLE_MANAGER = 'manager';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nomor_str',
        'no_hp',
        'alamat',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get all transactions made by this user
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'user_id');
    }

    /**
     * Get all activity logs for this user
     */
    public function logAktivitas(): HasMany
    {
        return $this->hasMany(LogAktivitas::class, 'user_id');
    }

    /**
     * Get all QR scan logs for this user
     */
    public function qrScanLogs(): HasMany
    {
        return $this->hasMany(QrScanLog::class, 'user_id');
    }

    /**
     * Get all notifications for this user
     */
    public function notifikasi(): HasMany
    {
        return $this->hasMany(Notifikasi::class, 'user_id');
    }

    /**
     * Get unread notifications
     */
    public function unreadNotifikasi(): HasMany
    {
        return $this->notifikasi()->where('is_read', false);
    }

    /**
     * Get requests processed by this user
     */
    public function processedPermintaan(): HasMany
    {
        return $this->hasMany(PermintaanUnit::class, 'processed_by');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is pharmacist
     */
    public function isPharmacist(): bool
    {
        return $this->role === self::ROLE_PHARMACIST;
    }

    /**
     * Check if user is manager
     */
    public function isManager(): bool
    {
        return $this->role === self::ROLE_MANAGER;
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            return $this->role === $roles;
        }
        return in_array($this->role, $roles);
    }

    /**
     * Check if user can access pharmacist features
     */
    public function canAccessPharmacy(): bool
    {
        return $this->hasRole([self::ROLE_ADMIN, self::ROLE_PHARMACIST]);
    }

    /**
     * Check if user can manage users
     */
    public function canManageUsers(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Check if user can view reports
     */
    public function canViewReports(): bool
    {
        return $this->hasRole([self::ROLE_ADMIN, self::ROLE_PHARMACIST, self::ROLE_MANAGER]);
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific role
     */
    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope for pharmacists
     */
    public function scopePharmacists($query)
    {
        return $query->where('role', self::ROLE_PHARMACIST);
    }

    /**
     * Get role label in Indonesian
     */
    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            self::ROLE_ADMIN => 'Administrator',
            self::ROLE_PHARMACIST => 'Apoteker',
            self::ROLE_MANAGER => 'Manajer',
            default => 'Unknown',
        };
    }
}
