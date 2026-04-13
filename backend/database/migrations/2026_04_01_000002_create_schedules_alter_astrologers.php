<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // -- 1. SCHEDULES TABLE ----------------------------------
        Schema::create('astrologer_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('astrologer_id')
                  ->constrained('astrologers')
                  ->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['astrologer_id', 'day_of_week', 'is_active']);
        });

        // -- 2. ADD COLUMNS TO ASTROLOGERS (if not exist) --------
        Schema::table('astrologers', function (Blueprint $table) {
            if (!Schema::hasColumn('astrologers', 'is_available')) {
                $table->boolean('is_available')->default(true)->after('is_online');
            }
            if (!Schema::hasColumn('astrologers', 'consultation_type')) {
                $table->enum('consultation_type', ['chat','call','video','all'])
                      ->default('all')->after('is_available');
            }
            if (!Schema::hasColumn('astrologers', 'total_consultations')) {
                $table->unsignedInteger('total_consultations')
                      ->default(0)->after('total_reviews');
            }
            if (!Schema::hasColumn('astrologers', 'avg_response_time')) {
                $table->decimal('avg_response_time', 5, 2)
                      ->nullable()->comment('in minutes')->after('total_consultations');
            }
        });

        // -- 3. ADD INDEXES (only if not exist) -------------------
        $this->addIndexSafe('astrologers',
            ['is_online', 'is_verified', 'is_available'],
            'astrologers_is_online_is_verified_is_available_index'
        );
        $this->addIndexSafe('astrologers',
            ['rating'],
            'astrologers_rating_index'
        );
        $this->addIndexSafe('astrologers',
            ['price_per_minute'],
            'astrologers_price_per_minute_index'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologer_schedules');

        Schema::table('astrologers', function (Blueprint $table) {
            foreach ([
                'astrologers_is_online_is_verified_is_available_index',
                'astrologers_rating_index',
                'astrologers_price_per_minute_index',
            ] as $idx) {
                try { $table->dropIndex($idx); } catch (\Throwable $e) {}
            }
            foreach (['is_available','consultation_type','total_consultations','avg_response_time'] as $col) {
                if (Schema::hasColumn('astrologers', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }

    private function addIndexSafe(string $table, array $cols, string $name): void
    {
        $exists = DB::select(
            "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
            [$name]
        );

        if (empty($exists)) {
            Schema::table($table, fn (Blueprint $t) => $t->index($cols, $name));
        }
    }
};