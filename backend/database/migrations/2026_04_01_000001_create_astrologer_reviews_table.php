<?php
// Creates the reviews table -- rating/total_reviews fields existed on astrologers but had no backing table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('astrologer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('astrologer_id')->constrained('astrologers')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');           // 1-5
            $table->text('comment')->nullable();
            $table->boolean('is_approved')->default(true);
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['user_id', 'astrologer_id']);    // ek user ek hi review de sakta
            $table->index(['astrologer_id', 'is_approved']); // listing query fast
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologer_reviews');
    }
};