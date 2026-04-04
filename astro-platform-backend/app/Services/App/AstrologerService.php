<?php
// PATH: app/Services/App/AstrologerService.php
// UPDATE — Major rewrite extending BaseService
// CHANGES:
//   - BaseService extend kiya (DRY CRUD)
//   - createWithUser(): transaction mein user + astrologer banata hai (pehle sirf astrologer banta tha)
//   - selfUpdate(): astrologer sirf apne allowed fields update kare
//   - toggleOnline(): online/offline toggle
//   - recalculateRating(): review submit ke baad rating recalculate
//   - publicList(): AstrologerQuery filters use karta hai
//   - adminList(): search + is_verified filter

namespace App\Services\App;

use App\DTO\AstrologerData;
use App\Models\Astrologer;
use App\Models\User;
use App\Queries\AstrologerQuery;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AstrologerService extends BaseService
{
    protected function model(): string { return Astrologer::class; }

    // ── Public listing (user-facing, filtered + sorted) ───────
    public function publicList(array $filters = []): LengthAwarePaginator
    {
        return AstrologerQuery::publicBase($filters)->paginate(12);
    }

    public function findPublic(int $id): Astrologer
    {
        return AstrologerQuery::publicBase()
            ->where('astrologers.id', $id)
            ->firstOrFail();
    }

    // ── Admin listing ─────────────────────────────────────────
    public function adminList(array $filters = []): LengthAwarePaginator
    {
        return AstrologerQuery::adminBase($filters)->paginate(15);
    }

    // ── Create with User (transaction) ────────────────────────
    // PEHLE: Sirf Astrologer record banta tha, user account nahi banta tha
    // BAAD:  User + Astrologer dono transaction mein bante hain
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

            $dto = AstrologerData::fromArray($data, $user->id);
            $astrologer = Astrologer::create([
                'user_id'           => $dto->user_id,
                'experience'        => $dto->experience,
                'price_per_minute'  => $dto->price_per_minute,
                'bio'               => $dto->bio,
                'expertise'         => $dto->expertise,
                'languages'         => $dto->languages,
                'skills'            => $dto->skills,
                'consultation_type' => $dto->consultation_type,
                'profile_image'     => $dto->profile_image,
                'gallery'           => $dto->gallery ?? [],
            ]);

            $this->clearCache();
            return ['user' => $user, 'astrologer' => $astrologer->load('user'), 'password' => $password];
        });
    }

    // ── Admin update (user + astrologer fields) ───────────────
    public function update(Model $model, array $data): Model
    {
        return DB::transaction(function () use ($model, $data) {
            if (isset($data['name']) || isset($data['email'])) {
                $model->user->update(array_filter([
                    'name'  => $data['name']  ?? null,
                    'email' => $data['email'] ?? null,
                ], fn($v) => !is_null($v)));
            }

            $allowed = ['experience','price_per_minute','bio','expertise','languages','skills',
                        'consultation_type','is_available','is_verified','profile_image','gallery'];

            $model->update(array_filter(
                array_intersect_key($data, array_flip($allowed)),
                fn($v) => !is_null($v)
            ));

            $this->clearCache();
            return $model->fresh(['user']);
        });
    }

    // ── Self update (astrologer updates own profile) ──────────
    // NEW: Sirf allowed fields update ho sakti hain
    public function selfUpdate(Astrologer $astrologer, array $data): Astrologer
    {
        $allowed = ['bio','experience','price_per_minute','languages','skills',
                    'consultation_type','profile_image','gallery','is_available'];

        $astrologer->update(array_intersect_key($data, array_flip($allowed)));
        $this->clearCache();
        return $astrologer->fresh(['user']);
    }

    // ── Online toggle ─────────────────────────────────────────
    // NEW: Astrologer online/offline toggle kar sake
    public function toggleOnline(Astrologer $astrologer): Astrologer
    {
        $astrologer->update(['is_online' => !$astrologer->is_online]);
        return $astrologer->fresh();
    }

    // ── Rating recalculate ────────────────────────────────────
    // NEW: Review submit ke baad avg rating recalculate
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

    private function clearCache(): void
    {
        Cache::forget('astrologers.public');
        Cache::forget('astrologers.admin');
        Cache::forget('dashboard.stats');
    }
}