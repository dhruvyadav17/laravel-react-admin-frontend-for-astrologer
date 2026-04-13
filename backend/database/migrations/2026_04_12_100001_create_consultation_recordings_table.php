<?php
// Stores metadata for consultation recordings (audio/video)
// Actual files stored in storage/app/public/recordings/

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('consultation_recordings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('consultation_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('filename');              // recordings/2026/04/{uuid}.webm
            $table->string('disk')->default('public'); // storage disk
            $table->enum('type', ['audio', 'video'])->default('audio');
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->enum('status', ['uploading', 'ready', 'failed'])->default('uploading');

            $table->timestamps();

            $table->index('consultation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_recordings');
    }
};
