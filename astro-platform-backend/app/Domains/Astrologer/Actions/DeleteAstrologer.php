<?php

namespace App\Domains\Astrologer\Actions;

use App\Models\Astrologer;

class DeleteAstrologer
{
    public function execute(Astrologer $astrologer): void
    {
        $astrologer->delete();
    }
}