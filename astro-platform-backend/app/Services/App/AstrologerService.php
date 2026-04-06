<?php

namespace App\Services\App;

use App\Models\Astrologer;
use App\Domains\Astrologer\Queries\AstrologerQuery;
use App\Domains\Astrologer\DTO\AstrologerData;
use App\Domains\Astrologer\Actions\CreateAstrologer;
use Illuminate\Support\Facades\DB;

class AstrologerService
{
    public function __construct(
        protected AstrologerQuery $query,
        protected CreateAstrologer $createAction,
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
        return DB::transaction(function () use ($astrologer, $data) {

            if (isset($data['name']) || isset($data['email'])) {
                $astrologer->user->update(array_filter([
                    'name' => $data['name'] ?? null,
                    'email' => $data['email'] ?? null,
                ]));
            }

            $astrologer->update($data);

            return $astrologer->fresh(['user']);
        });
    }

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