<?php

namespace App\Domains\Astrologer\Queries;

use App\Models\Astrologer;

class AstrologerQuery
{
    public function publicList(array $filters = [])
    {
        return Astrologer::query()
            ->with('user')
            ->where('is_verified', true)
            ->whereNull('deleted_at')
            ->when($filters['search'] ?? null, fn($q, $s) =>
                $q->where('expertise', 'like', "%$s%")
            )
            ->latest();
    }

    public function adminList(array $filters = [])
    {
        return Astrologer::query()
            ->with('user')
            ->withTrashed()
            ->when($filters['search'] ?? null, fn($q, $s) =>
                $q->whereHas('user', fn($q) =>
                    $q->where('name', 'like', "%$s%")
                )
            )
            ->when(isset($filters['is_verified']), fn($q) =>
                $q->where('is_verified', $filters['is_verified'])
            )
            ->latest();
    }

    public function find(int $id): Astrologer
    {
        return Astrologer::with(['user', 'schedules'])->findOrFail($id);
    }
}