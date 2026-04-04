<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('astrologers', function (Blueprint $table) {
            $table->id();

            // 🔗 RELATION
            $table->foreignId('user_id')
                ->unique() // 🔥 ADD THIS
                ->constrained()
                ->cascadeOnDelete();

            // 🖼️ PROFILE
            $table->string('profile_image')->nullable();
            $table->json('gallery')->nullable(); // multiple images

            // 🧾 INFO
            $table->text('bio')->nullable();
            $table->string('expertise')->nullable();
            $table->json('languages')->nullable();
            $table->json('skills')->nullable();

            // 💼 EXPERIENCE & PRICING
            $table->unsignedInteger('experience')->default(0);
            $table->decimal('price_per_minute', 8, 2)->default(0);

            // ⭐ RATINGS
            $table->decimal('rating', 3, 2)->default(0); // max 9.99
            $table->unsignedInteger('total_reviews')->default(0);
            // $table->integer('total_reviews')->default(0);           

            // 🟢 STATUS
            $table->boolean('is_online')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->softDeletes();
            // ⏱️ META
            $table->timestamps();

            // ⚡ INDEXES (IMPORTANT)
            $table->index('user_id');
            $table->index('rating');
            $table->index(['is_online', 'is_verified']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('astrologers');
    }
};
