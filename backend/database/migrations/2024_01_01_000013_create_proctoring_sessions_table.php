<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // public function up(): void
    // {
    //     Schema::create('proctoring_sessions', function (Blueprint $table) {
    //         $table->id();
    //         $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
    //         $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
    //         $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

    //         $table->dateTime('session_started_at');
    //         $table->dateTime('session_ended_at')->nullable();
    //         $table->enum('status', ['active', 'paused', 'completed', 'terminated'])->default('active');

    //         // Device verification
    //         $table->json('device_fingerprint')->nullable();
    //         $table->string('ip_address');
    //         $table->json('network_info')->nullable();
    //         $table->string('browser');
    //         $table->string('os');
    //         $table->json('screen_info')->nullable();

    //         // Connection monitoring
    //         $table->enum('connection_status', ['stable', 'unstable', 'disconnected'])->default('stable');
    //         $table->integer('disconnection_count')->default(0);
    //         $table->json('disconnection_log')->nullable();

    //         // Activity tracking
    //         $table->dateTime('last_activity_at')->nullable();
    //         $table->integer('idle_time_seconds')->default(0);
    //         $table->integer('active_time_seconds')->default(0);

    //         // Violation summary
    //         $table->integer('total_violations')->default(0);
    //         $table->json('violation_summary')->nullable();

    //         // Recording paths
    //         $table->string('screen_recording_path')->nullable();
    //         $table->string('webcam_recording_path')->nullable();
    //         $table->integer('recording_duration_seconds')->nullable();

    //         // Supervisor actions
    //         $table->json('supervisor_notes')->nullable();
    //         $table->json('supervisor_messages')->nullable();

    //         $table->timestamps();

    //         $table->index(['exam_id', 'status']);
    //         $table->index('user_id');
    //         $table->unique('exam_attempt_id');
    //     });
    // }

    public function up(): void
    {
        Schema::create('proctoring_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('status', ['active', 'completed', 'terminated'])->default('active');
            $table->dateTime('started_at');
            $table->dateTime('ended_at')->nullable();

            $table->string('browser')->nullable();
            $table->string('browser_version')->nullable();
            $table->string('os')->nullable();
            $table->json('screen_info')->nullable();

            $table->enum('connection_status', ['stable', 'unstable', 'disconnected'])->default('stable');
            $table->integer('disconnection_count')->default(0);
            $table->json('disconnection_log')->nullable();

            $table->dateTime('last_activity_at')->nullable();
            $table->integer('idle_time_seconds')->default(0);
            $table->integer('active_time_seconds')->default(0);

            $table->integer('total_violations')->default(0);
            $table->json('violation_summary')->nullable();

            $table->string('screen_recording_path')->nullable();
            $table->string('webcam_recording_path')->nullable();
            $table->integer('recording_duration_seconds')->nullable();

            $table->json('supervisor_notes')->nullable();
            $table->json('supervisor_messages')->nullable();

            $table->timestamps();

            $table->index(['exam_id', 'status']);
            $table->index('user_id');
            $table->unique('exam_attempt_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proctoring_sessions');
    }
};
