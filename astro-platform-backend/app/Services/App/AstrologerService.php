<?php
// PATH: app/Services/App/AstrologerService.php
// FIX BUG-7: toggleOnline() sirf is_online toggle karta tha — is_available sync nahi hoti thi
//             Frontend PATCH /astrologer/me/availability → { is_online, is_available } dono expect karta hai
//             Logic: online karo → dono true; offline karo → is_online false, is_available false
// FIX BUG-8: publicList() / adminList() mein inline query logic tha
//             AstrologerQuery class already exist karti hai more complete logic ke saath
//             (min_price, max_price support bhi tha jo service mein nahi tha)
//             Ab service AstrologerQuery ko delegate karti hai — DRY, testable

namespace App\Services\App;

use App\Models\Astrologer;
use App\Models\User;
use App\Queries\AstrologerQuery;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AstrologerService
{
    /* ── Public listing (delegate to AstrologerQuery) ── */
    // FIX BUG-8: Inline filter logic hata ke AstrologerQuery use kiya
    //             Ab min_price, max_price filters bhi kaam karenge
    public function publicList(array $filters = [])
    {
        return AstrologerQuery::publicBase($filters)->paginate(12);
    }

    /* ── Public single ──────────────────────────────── */
    public function findPublic(int $id): Astrologer
    {
        return Astrologer::with('user')
            ->where('is_verified', true)
            ->findOrFail($id);
    }

    /* ── Admin listing (delegate to AstrologerQuery) ── */
    // FIX BUG-8: Same — AstrologerQuery.adminBase() use kiya
    public function adminList(array $filters = [])
    {
        return AstrologerQuery::adminBase($filters)->paginate(15);
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
                'is_available'      => true,
            ]);

            return [
                'user'       => $user,
                'astrologer' => $astrologer->load('user'),
                'password'   => $password,
            ];
        });
    }

    /* ── Admin update ───────────────────────────────── */
    public function update(Astrologer $astrologer, array $data): Astrologer
    {
        return DB::transaction(function () use ($astrologer, $data) {
            if (isset($data['name']) || isset($data['email'])) {
                $astrologer->user->update(array_filter([
                    'name'  => $data['name']  ?? null,
                    'email' => $data['email'] ?? null,
                ]));
            }

            $allowed = [
                'experience', 'price_per_minute', 'bio', 'expertise',
                'languages', 'skills', 'consultation_type', 'is_available',
                'is_verified', 'profile_image', 'gallery',
            ];
            $astrologer->update(array_intersect_key($data, array_flip($allowed)));

            return $astrologer->fresh(['user']);
        });
    }

    /* ── Self update (astrologer portal) ────────────── */
    public function selfUpdate(Astrologer $astrologer, array $data): Astrologer
    {
        $allowed = [
            'bio', 'experience', 'price_per_minute', 'languages',
            'skills', 'consultation_type', 'profile_image', 'gallery', 'is_available',
        ];
        $astrologer->update(array_intersect_key($data, array_flip($allowed)));
        return $astrologer->fresh(['user']);
    }

    /* ── Toggle online status ───────────────────────── */
    // FIX BUG-7: Pehle sirf is_online toggle hota tha
    //             is_available ka status galat rehta tha — astrologer offline tha
    //             but is_available=true rehta tha → frontend mein "Available" dikhta tha
    //             Ab dono sync hote hain:
    //               Online ho  → is_online=true,  is_available=true
    //               Offline ho → is_online=false, is_available=false
    public function toggleOnline(Astrologer $astrologer): Astrologer
    {
        $goingOnline = !$astrologer->is_online;

        $astrologer->update([
            'is_online'    => $goingOnline,
            'is_available' => $goingOnline,  // FIX: sync karo
        ]);

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

    /* ── Soft Delete ────────────────────────────────── */
    public function delete(Astrologer $astrologer): void
    {
        $astrologer->delete();
    }

    /* ── Restore ────────────────────────────────────── */
    public function restore(int $id): Astrologer
    {
        $a = Astrologer::withTrashed()->findOrFail($id);
        $a->restore();
        return $a->fresh(['user']);
    }
}
