<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Astrologer extends Model
{
    protected $guarded =[];
    protected $casts = [
        'languages' => 'array',
        'skills' => 'array',
        'gallery' => 'array',
        'is_online' => 'boolean',
        'is_verified' => 'boolean',
    ];

    /* ================= RELATIONS ================= */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ================= SCOPES ================= */

    public function scopeOnline($query)
    {
        return $query->where('is_online', true);
    }

    public function scopeTopRated($query)
    {
        return $query->orderByDesc('rating');
    }
}
