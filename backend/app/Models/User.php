<?php
// PATH: app/Models/User.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $guarded    = [];
    protected $guard_name = 'api';

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /* ── Role helpers ───────────────────────────── */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    public function isAdmin(): bool
    {
        return $this->isSuperAdmin() || $this->hasAnyRole(config('roles.admin_roles', []));
    }

    public function isAstrologer(): bool
    {
        return $this->hasRole('astrologer');
    }

    /* ── Relations ──────────────────────────────── */
    public function astrologer()
    {
        return $this->hasOne(Astrologer::class);
    }

    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }
}
