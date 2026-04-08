<?php
// PATH: app/Models/Astrologer.php
// FIX: HasFactory trait add kiya — factory() method ke liye zaroori hai

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // ADD
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Astrologer extends Model
{
    use HasFactory, SoftDeletes; // HasFactory ADD kiya

    protected $fillable = [
        'user_id', 'experience', 'price_per_minute', 'bio', 'expertise',
        'languages', 'skills', 'consultation_type',
        'rating', 'total_reviews', 'total_consultations', 'avg_response_time',
        'is_online', 'is_available', 'is_verified', 'profile_image', 'gallery',
    ];

    protected $casts = [
        'languages'         => 'array',
        'skills'            => 'array',
        'gallery'           => 'array',
        'rating'            => 'float',
        'price_per_minute'  => 'float',
        'avg_response_time' => 'float',
        'is_online'         => 'boolean',
        'is_available'      => 'boolean',
        'is_verified'       => 'boolean',
    ];

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function reviews(): HasMany   { return $this->hasMany(AstrologerReview::class); }
    public function schedules(): HasMany { return $this->hasMany(AstrologerSchedule::class); }
    public function consultations(): HasMany { return $this->hasMany(\App\Models\Consultation::class); }

    /* ── Accessors — delegate to user relation ── */
    public function getNameAttribute(): string
    {
        return $this->user?->name ?? '';
    }

    public function getEmailAttribute(): string
    {
        return $this->user?->email ?? '';
    }

    public function scopeVerified($q)              { return $q->where('is_verified', true); }
    public function scopeOnline($q)                { return $q->where('is_online', true)->where('is_available', true); }
    public function scopeTopRated($q)              { return $q->orderByDesc('rating'); }
    public function scopeByExpertise($q, string $e){ return $q->where('expertise', 'like', "%{$e}%"); }
    public function isAvailableNow(): bool         { return $this->is_online && $this->is_available; }
}