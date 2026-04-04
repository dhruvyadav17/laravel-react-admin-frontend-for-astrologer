<?php
// PATH: database/migrations/2026_04_01_000001_create_astrologer_reviews_table.php
// NEW FILE — Review system ke liye. rating/total_reviews fields the lekin koi reviews table nahi tha.

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