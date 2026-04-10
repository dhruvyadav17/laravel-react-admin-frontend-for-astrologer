<?php
// PATH: database/migrations/2026_04_10_100002_create_wallet_transactions_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['credit', 'debit', 'refund']);
            $table->decimal('amount', 10, 2);
            $table->decimal('balance_after', 10, 2);
            $table->string('description');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->string('reference')->nullable(); // payment gateway ref
            $table->timestamps();
            $table->index(['user_id', 'type']);
            $table->index('created_at');
        });
    }
    public function down(): void { Schema::dropIfExists('wallet_transactions'); }
};
