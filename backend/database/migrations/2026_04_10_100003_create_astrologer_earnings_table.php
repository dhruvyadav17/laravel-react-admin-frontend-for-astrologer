<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('astrologer_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('astrologer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('platform_fee', 10, 2);   // 20%
            $table->decimal('net_amount', 10, 2);      // 80%
            $table->enum('status', ['pending', 'settled'])->default('pending');
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
            $table->index(['astrologer_id', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('astrologer_earnings'); }
};
