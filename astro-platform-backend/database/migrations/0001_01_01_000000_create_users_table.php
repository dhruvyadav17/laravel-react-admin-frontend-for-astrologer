<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // 🧑 Basic Info
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();

            // 🔐 Auth
            $table->string('password');
            $table->rememberToken();

            // 🔐 Account Control
            $table->boolean('is_active')->default(true);
            $table->boolean('force_password_reset')->default(false);

            // 🕒 Login Info
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

            // 🚫 Brute-force Protection
            $table->unsignedTinyInteger('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();

            // 🔁 Password Policy
            $table->timestamp('password_changed_at')->nullable();

            // 🗑 Meta
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
