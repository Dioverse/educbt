<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_fingerprints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('fingerprint_hash')->unique();

            // Browser & Device info
            $table->string('user_agent');
            $table->string('browser_name')->nullable();
            $table->string('browser_version')->nullable();
            $table->string('os_name')->nullable();
            $table->string('os_version')->nullable();
            $table->string('device_type')->nullable();
            $table->string('device_vendor')->nullable();
            $table->string('device_model')->nullable();

            // Screen & Display
            $table->string('screen_resolution')->nullable();
            $table->integer('screen_width')->nullable();
            $table->integer('screen_height')->nullable();
            $table->integer('color_depth')->nullable();
            $table->integer('pixel_ratio')->nullable();
            $table->integer('available_width')->nullable();
            $table->integer('available_height')->nullable();
            $table->string('orientation')->nullable();

            // Network
            $table->string('ip_address');
            $table->string('isp')->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('timezone')->nullable();

            // Browser capabilities
            $table->json('plugins')->nullable();
            $table->json('fonts')->nullable();
            $table->boolean('cookies_enabled')->default(true);
            $table->boolean('local_storage_enabled')->default(true);
            $table->boolean('session_storage_enabled')->default(true);
            $table->boolean('indexed_db_enabled')->default(true);
            $table->string('canvas_fingerprint')->nullable();
            $table->string('webgl_fingerprint')->nullable();
            $table->string('audio_fingerprint')->nullable();

            // Advanced detection
            $table->boolean('is_virtual_machine')->nullable();
            $table->boolean('is_emulator')->nullable();
            $table->boolean('has_touch_support')->nullable();
            $table->integer('max_touch_points')->nullable();
            $table->json('media_devices')->nullable();

            // Hardware
            $table->integer('cpu_cores')->nullable();
            $table->integer('memory_gb')->nullable();
            $table->string('gpu_vendor')->nullable();
            $table->string('gpu_renderer')->nullable();

            // Trust score
            $table->decimal('trust_score', 5, 4)->nullable();
            $table->json('anomaly_flags')->nullable();

            $table->timestamp('captured_at');
            $table->timestamps();

            $table->index('user_id');
            $table->index('ip_address');
            $table->index('trust_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_fingerprints');
    }
};
