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
    public function __construct(
        protected AstrologerQuery $query,
        protected CreateAstrologer $createAction,
        protected UpdateAstrologer $updateAction,
        protected DeleteAstrologer $deleteAction,
    ) {}

    /* ── Public listing ─────────────────────────── */
    public function publicList(array $filters = [])
    {
        return $this->query->publicList($filters)->paginate(12);
    }

    /* ── Public single ─────────────────────────── */
    public function findPublic(int $id): Astrologer
    {
        return $this->query->find($id);
    }

    /* ── Admin listing ─────────────────────────── */
    public function adminList(array $filters = [])
    {
        return $this->query->adminList($filters)->paginate(15);
    }

    /* ── Create ─────────────────────────── */
    public function createWithUser(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $dto = AstrologerData::fromArray($data);
            return $this->createAction->execute($dto);
        });
    }

    /* ── Update ─────────────────────────── */
    public function update(Astrologer $astrologer, array $data): Astrologer
    {
        return $this->updateAction->execute($astrologer, $data);
    }

    /* ── Self Update (Astrologer Panel) ───────────────── */
    public function selfUpdate(Astrologer $astrologer, array $data): Astrologer
    {
        unset($data['is_verified']); // 🔥 security

        return $this->updateAction->execute($astrologer, $data);
    }

    /* ── Delete ─────────────────────────── */
    public function delete(Astrologer $astrologer): void
    {
        $this->deleteAction->execute($astrologer);
    }

    /* ── Restore ─────────────────────────── */
    public function restore(int $id): Astrologer
    {
        $a = Astrologer::withTrashed()->findOrFail($id);
        $a->restore();
        return $a->fresh(['user']);
    }

    /* ── Toggle Online ─────────────────────────── */
    public function toggleOnline(Astrologer $astrologer): Astrologer
    {
        $astrologer->update([
            'is_online' => !$astrologer->is_online
        ]);

        return $astrologer->fresh();
    }
    public function recalculateRating(Astrologer $astrologer): void
    {
        $avg = $astrologer->reviews()->avg('rating') ?? 0;

        $astrologer->update([
            'rating' => round($avg, 1),
        ]);
    }
}
