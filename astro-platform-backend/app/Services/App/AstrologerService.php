<?php
// PATH: app/Services/App/AstrologerService.php
// SIMPLIFIED: BaseService dependency hatao, direct Eloquent use karo

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AstrologerService
{
    /* ── Public listing ─────────────────────────────── */
    public function publicList(array $filters = [])
    {
        $q = Astrologer::with('user')
            ->where('is_verified', true);

        if (!empty($filters['online']))
            $q->where('is_online', true)->where('is_available', true);

        if (!empty($filters['expertise']))
            $q->where('expertise', 'like', '%'.$filters['expertise'].'%');

        if (!empty($filters['language']))
            $q->whereJsonContains('languages', $filters['language']);

        if (!empty($filters['min_rating']))
            $q->where('rating', '>=', (float)$filters['min_rating']);

        if (!empty($filters['consultation_type']) && $filters['consultation_type'] !== 'all')
            $q->where(fn($s) => $s->where('consultation_type', $filters['consultation_type'])
                ->orWhere('consultation_type', 'all'));

        match ($filters['sort'] ?? 'top_rated') {
            'price_low'  => $q->orderBy('price_per_minute'),
            'price_high' => $q->orderByDesc('price_per_minute'),
            'experience' => $q->orderByDesc('experience'),
            'newest'     => $q->orderByDesc('astrologers.created_at'),
            default      => $q->orderByDesc('rating'),
        };

        return $q->paginate(12);
    }

    public function findPublic(int $id): Astrologer
    {
        return Astrologer::with('user')
            ->where('is_verified', true)
            ->findOrFail($id);
    }

    /* ── Admin listing ──────────────────────────────── */
    public function adminList(array $filters = [])
    {
        $q = Astrologer::withTrashed()->with('user')->latest();

        if (!empty($filters['search'])) {
            $s = '%'.$filters['search'].'%';
            $q->whereHas('user', fn($sq) =>
                $sq->where('name','like',$s)->orWhere('email','like',$s)
            )->orWhere('expertise','like',$s);
        }

        if (isset($filters['is_verified']))
            $q->where('is_verified', (bool)$filters['is_verified']);

        return $q->paginate(15);
    }

    /* ── Create with user ───────────────────────────── */
    public function createWithUser(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $password = $data['password'] ?? str()->random(10);

            $user = User::create([
                'name'              => $data['name'],
                'email'             => $data['email'],
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
                'is_verified'       => true,
                'profile_image'     => $data['profile_image'] ?? null,
            ]);
            $user->assignRole('astrologer');

            $astrologer = Astrologer::create([
                'user_id'           => $user->id,
                'experience'        => $data['experience']        ?? 0,
                'price_per_minute'  => $data['price_per_minute']  ?? 0,
                'bio'               => $data['bio']               ?? '',
                'expertise'         => $data['expertise']         ?? '',
                'languages'         => $data['languages']         ?? [],
                'skills'            => $data['skills']            ?? [],
                'consultation_type' => $data['consultation_type'] ?? 'all',
                'is_verified'       => true,
            ]);

            return ['user' => $user, 'astrologer' => $astrologer->load('user'), 'password' => $password];
        });
    }

    /* ── Update ─────────────────────────────────────── */
    public function update(Astrologer $astrologer, array $data): Astrologer
    {
        return DB::transaction(function () use ($astrologer, $data) {
            if (isset($data['name']) || isset($data['email'])) {
                $astrologer->user->update(array_filter([
                    'name'  => $data['name']  ?? null,
                    'email' => $data['email'] ?? null,
                ]));
            }
            $allowed = ['experience','price_per_minute','bio','expertise',
                        'languages','skills','consultation_type','is_available',
                        'is_verified','profile_image','gallery'];
            $astrologer->update(array_intersect_key($data, array_flip($allowed)));
            return $astrologer->fresh(['user']);
        });
    }

    /* ── Self update (astrologer portal) ────────────── */
    public function selfUpdate(Astrologer $astrologer, array $data): Astrologer
    {
        $allowed = ['bio','experience','price_per_minute','languages',
                    'skills','consultation_type','profile_image','gallery','is_available'];
        $astrologer->update(array_intersect_key($data, array_flip($allowed)));
        return $astrologer->fresh(['user']);
    }

    /* ── Toggle online ──────────────────────────────── */
    public function toggleOnline(Astrologer $astrologer): Astrologer
    {
        $astrologer->update(['is_online' => !$astrologer->is_online]);
        return $astrologer->fresh();
    }

    /* ── Recalculate rating ─────────────────────────── */
    public function recalculateRating(Astrologer $astrologer): void
    {
        $stats = $astrologer->reviews()
            ->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        $astrologer->update([
            'rating'        => round((float)($stats->avg_rating ?? 0), 2),
            'total_reviews' => $stats->total ?? 0,
        ]);
    }

    /* ── Delete / Restore ───────────────────────────── */
    public function delete(Astrologer $astrologer): void
    {
        $astrologer->delete();
    }

    public function restore(int $id): Astrologer
    {
        $a = Astrologer::withTrashed()->findOrFail($id);
        $a->restore();
        return $a->fresh(['user']);
    }
}