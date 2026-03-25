<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // ================= BASIC =================
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();

            // ================= AUTH =================
            $table->string('password');
            $table->rememberToken();

            // ================= ACCOUNT CONTROL =================
            $table->boolean('is_active')->default(true);
            $table->boolean('force_password_reset')->default(false);

            // ================= LOGIN INFO =================
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

            // ================= SECURITY =================
            $table->unsignedTinyInteger('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();

            // ================= PASSWORD POLICY =================
            $table->timestamp('password_changed_at')->nullable();

            // ===================================================
            // 🔮 ASTROLOGER FIELDS (IMPROVED)
            // ===================================================

            // Profile
            $table->string('profile_image')->nullable();

            // 🔥 NEW: multiple images (gallery)
            $table->json('gallery')->nullable();

            // About
            $table->text('bio')->nullable();

            // Expertise (short text)
            $table->string('expertise')->nullable();

            // 🔥 FIXED: use JSON instead of string
            $table->json('languages')->nullable();
            $table->json('skills')->nullable();

            // Experience & Pricing
            $table->unsignedInteger('experience')->default(0);
            $table->decimal('price_per_minute', 8, 2)->default(0);

            // Status
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_online')->default(false);

            // Ratings
            $table->decimal('rating', 3, 2)->default(0); // max 9.99
            $table->unsignedInteger('total_reviews')->default(0);

            // ================= META =================
            $table->softDeletes();
            $table->timestamps();

            // ================= INDEXES =================
            $table->index(['is_active', 'is_verified']);
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};