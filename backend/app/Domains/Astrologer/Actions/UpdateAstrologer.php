<?php

namespace App\Domains\Astrologer\Actions;

use App\Models\Astrologer;
use Illuminate\Support\Facades\DB;

class UpdateAstrologer
{
    public function execute(Astrologer $astrologer, array $data): Astrologer
    {
        return DB::transaction(function () use ($astrologer, $data) {

            // 🔥 User update logic centralized
            if (isset($data['name']) || isset($data['email'])) {
                $astrologer->user->update(array_filter([
                    'name'  => $data['name'] ?? null,
                    'email' => $data['email'] ?? null,
                ]));
            }

            $astrologer->update($data);

            return $astrologer->fresh(['user']);
        });
    }
}