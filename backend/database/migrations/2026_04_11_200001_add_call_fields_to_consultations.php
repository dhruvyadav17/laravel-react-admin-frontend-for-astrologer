<?php
// Add room_id for WebRTC signaling
// Add call_status for call/video state tracking

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            // Unique room ID for WebRTC peer connection
            $table->string('room_id', 64)->nullable()->unique()->after('user_note');

            // Call/video specific status
            // null = chat type (no call), 'idle' = waiting, 'ringing' = user receiving,
            // 'active' = call live, 'ended' = call finished
            $table->enum('call_status', ['idle', 'ringing', 'active', 'ended'])
                  ->nullable()->after('room_id');
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['room_id', 'call_status']);
        });
    }
};
