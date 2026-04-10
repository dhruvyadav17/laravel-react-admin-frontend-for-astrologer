<?php
// PATH: app/Features/Astrologer/Services/AstrologerService.php
// FIX B9: selfUpdate() sirf is_verified strip karta tha — whitelist approach use karo
//   Astrologer rating, total_consultations etc khud set kar sakta tha
// FIX B10: toggleAvailability() ab is_online + is_available dono toggle karta hai
// FIX B8: recalculateRating() mein is_approved filter

namespace App\Features\Astrologer\Services;

use App\Models\Astrologer;
use App\Features\Astrologer\Queries\AstrologerQuery;
use App\Features\Astrologer\DTO\AstrologerData;
use App\Features\Astrologer\Actions\CreateAstrologer;
use App\Features\Astrologer\Actions\UpdateAstrologer;
use App\Features\Astrologer\Actions\DeleteAstrologer;
use Illuminate\Support\Facades\DB;

class AstrologerService
{
    // FIX B9: Only these fields allowed for self-update
    private const SELF_UPDATE_ALLOWED = [
        'bio', 'expertise', 'languages', 'skills',
        'consultation_type', 'price_per_minute',
        'profile_image', 'gallery',
    ];

    public function __construct(
        protected AstrologerQuery  $query,
        protected CreateAstrologer $createAction,
        protected UpdateAstrologer $updateAction,
        protected DeleteAstrologer $deleteAction,
    ) {}

    public function publicList(array $filters = [])
    {
        return $this->query->publicList($filters)->paginate(12);
    }

    public function findPublic(int $id): Astrologer
    {
        return $this->query->find($id);
    }

    public function adminList(array $filters = [])
    {
        return $this->query->adminList($filters)->paginate(15);
    }

    public function createWithUser(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $dto = AstrologerData::fromArray($data);
            return $this->createAction->execute($dto);
        });
    }

    public function update(Astrologer $astrologer, array $data): Astrologer
    {
        return $this->updateAction->execute($astrologer, $data);
    }

    // FIX B9: Whitelist — admin-only fields block kiye
    public function selfUpdate(Astrologer $astrologer, array $data): Astrologer
    {
        $safe = array_intersect_key($data, array_flip(self::SELF_UPDATE_ALLOWED));

        return $this->updateAction->execute($astrologer, $safe);
    }

    public function delete(Astrologer $astrologer): void
    {
        $this->deleteAction->execute($astrologer);
    }

    public function restore(int $id): Astrologer
    {
        $a = Astrologer::withTrashed()->findOrFail($id);
        $a->restore();
        return $a->fresh(['user']);
    }

    // FIX B10: Both is_online and is_available toggle together
    public function toggleAvailability(Astrologer $astrologer): Astrologer
    {
        $newOnline = ! $astrologer->is_online;

        $astrologer->update([
            'is_online'    => $newOnline,
            'is_available' => $newOnline,
        ]);

        return $astrologer->fresh();
    }

    // FIX B8: Only approved reviews
    public function recalculateRating(Astrologer $astrologer): void
    {
        $approved = $astrologer->reviews()->where('is_approved', true);

        $astrologer->update([
            'rating'        => round((float) ($approved->avg('rating') ?? 0), 1),
            'total_reviews' => $approved->count(),
        ]);
    }
}
