<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proctoring_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('proctoring_session_id')->constrained('proctoring_sessions')->cascadeOnDelete();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();

            $table->enum('event_type', [
                'tab_switch',
                'window_blur',
                'fullscreen_exit',
                'copy_attempt',
                'paste_attempt',
                'right_click',
                'key_combination',
                'mouse_leave',
                'network_disconnect',
                'network_reconnect',
                'suspicious_activity',
                'multiple_faces_detected',
                'no_face_detected',
                'audio_detected',
                'screen_share_detected',
                'virtual_machine_detected',
                'external_display_detected',
                'other'
            ]);

            $table->text('description')->nullable();
            $table->json('event_data')->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('low');

            $table->integer('question_index_at_event')->nullable();
            $table->integer('time_into_exam_seconds')->nullable();
            $table->string('ip_address')->nullable();

            $table->string('screenshot_path')->nullable();
            $table->string('webcam_snapshot_path')->nullable();

            $table->boolean('is_flagged')->default(false);
            $table->boolean('requires_review')->default(false);

            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['proctoring_session_id', 'event_type']);
            $table->index(['occurred_at', 'severity']);
            $table->index('is_flagged');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proctoring_events');
    }
};
