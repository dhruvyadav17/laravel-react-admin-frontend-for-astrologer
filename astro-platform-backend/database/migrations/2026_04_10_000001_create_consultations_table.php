<?php
// PATH: database/migrations/2026_04_10_000001_create_consultations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('astrologer_id')->constrained()->cascadeOnDelete();

            // Type: chat / call / video
            $table->enum('type', ['chat', 'call', 'video'])->default('chat');

            // Status flow: pending → accepted → in_progress → completed | rejected | cancelled
            $table->enum('status', [
                'pending',
                'accepted',
                'in_progress',
                'completed',
                'rejected',
                'cancelled',
            ])->default('pending');

            // Timing
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable(); // actual duration

            // Pricing
            $table->decimal('rate_per_minute', 8, 2);       // snapshot at booking time
            $table->decimal('total_amount', 10, 2)->nullable();

            // Optional user note when booking
            $table->text('user_note')->nullable();

            // Astrologer rejection reason
            $table->string('rejection_reason')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['astrologer_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};