<?php
// Run via: php artisan astrologer:mark-offline
// Schedule: every 5 minutes in routes/console.php

namespace App\Console\Commands;

use App\Models\Astrologer;
use Illuminate\Console\Command;

class MarkStaleAstrologersOffline extends Command
{
    protected $signature   = 'astrologer:mark-offline';
    protected $description = 'Mark astrologers offline if heartbeat > 5 minutes ago';

    public function handle(): void
    {
        $count = Astrologer::where('is_online', true)
            ->where(function ($q) {
                $q->whereNull('last_heartbeat_at')
                  ->orWhere('last_heartbeat_at', '<', now()->subMinutes(5));
            })
            ->update([
                'is_online'    => false,
                'is_available' => false,
            ]);

        $this->info("Marked {$count} astrologers offline.");
    }
}
