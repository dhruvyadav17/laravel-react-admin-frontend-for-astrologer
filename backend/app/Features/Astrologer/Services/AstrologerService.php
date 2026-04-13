<?php

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
    private const SELF_UPDATE_ALLOWED = [
        'bio', 'expertise', 'languages', 'skills',
        'consultation_type', 'price_per_minute',
        'profile_image', 'gallery',
    ];

    private const VALID_SORT    = ['top_rated', 'price_low', 'price_high', 'experience', 'newest'];
    private const VALID_CONSULT = ['chat', 'call', 'video', 'all'];

    public function __construct(
        protected AstrologerQuery  $query,
        protected CreateAstrologer $createAction,
        protected UpdateAstrologer $updateAction,
        protected DeleteAstrologer $deleteAction,
    ) {}

    /* -- Public paginated list -------------------------------- */
    public function publicList(array $rawFilters = [])
    {
        $filters = $this->sanitizeFilters($rawFilters);
        $perPage = min((int) ($rawFilters['per_page'] ?? 12), 48); // max 48

        return $this->query->publicList($filters)->paginate($perPage);
    }

    /* -- Admin paginated list --------------------------------- */
    public function adminList(array $filters = [])
    {
        $perPage = min((int) ($filters['per_page'] ?? 15), 50);
        return $this->query->adminList($filters)->paginate($perPage);
    }

    public function findPublic(int $id): Astrologer
    {
        return $this->query->find($id);
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

    public function toggleAvailability(Astrologer $astrologer): Astrologer
    {
        $newOnline = !$astrologer->is_online;
        $astrologer->update(['is_online' => $newOnline, 'is_available' => $newOnline]);
        return $astrologer->fresh();
    }

    public function recalculateRating(Astrologer $astrologer): void
    {
        $approved = $astrologer->reviews()->where('is_approved', true);
        $astrologer->update([
            'rating'        => round((float) ($approved->avg('rating') ?? 0), 1),
            'total_reviews' => $approved->count(),
        ]);
    }

    /* -- Private: Sanitize & validate filters ----------------- */
    private function sanitizeFilters(array $raw): array
    {
        $f = [];

        if (!empty($raw['search']))  $f['search'] = substr(strip_tags($raw['search']), 0, 100);
        if (!empty($raw['online']))  $f['online']  = true;
        if (!empty($raw['language'])) $f['language'] = substr(strip_tags($raw['language']), 0, 50);
        if (!empty($raw['expertise'])) $f['expertise'] = substr(strip_tags($raw['expertise']), 0, 100);

        if (isset($raw['min_price']) && is_numeric($raw['min_price'])) {
            $f['min_price'] = max(0, (float) $raw['min_price']);
        }
        if (isset($raw['max_price']) && is_numeric($raw['max_price'])) {
            $f['max_price'] = min(99999, (float) $raw['max_price']);
        }
        if (isset($raw['min_rating']) && is_numeric($raw['min_rating'])) {
            $f['min_rating'] = max(0, min(5, (float) $raw['min_rating']));
        }
        if (isset($raw['consultation_type']) && in_array($raw['consultation_type'], self::VALID_CONSULT, true)) {
            $f['consultation_type'] = $raw['consultation_type'];
        }
        if (isset($raw['sort']) && in_array($raw['sort'], self::VALID_SORT, true)) {
            $f['sort'] = $raw['sort'];
        }

        return $f;
    }
}
