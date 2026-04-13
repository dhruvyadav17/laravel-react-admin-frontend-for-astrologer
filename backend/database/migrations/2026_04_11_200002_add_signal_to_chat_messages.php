<?php
// Add signal_type + signal_data for WebRTC offer/answer/ICE exchange
// These messages are internal signals, not shown in chat UI

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            // 'offer' | 'answer' | 'ice-candidate' | 'hang-up' | null (normal message)
            $table->string('signal_type', 20)->nullable()->after('message');
            // JSON payload for WebRTC signal
            $table->json('signal_data')->nullable()->after('signal_type');
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropColumn(['signal_type', 'signal_data']);
        });
    }
};
