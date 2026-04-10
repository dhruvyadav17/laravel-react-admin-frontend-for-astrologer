<?php
// PATH: database/migrations/2026_04_10_100001_create_wallets_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('balance', 10, 2)->default(0.00);
            $table->decimal('total_recharged', 10, 2)->default(0.00);
            $table->decimal('total_spent', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('wallets'); }
};
