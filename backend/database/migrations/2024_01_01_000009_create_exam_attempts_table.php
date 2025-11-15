<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('exam_attempts')
            ->whereNull('attempt_code')
            ->orWhere('attempt_code', '')
            ->update([
                'attempt_code' => DB::raw("CONCAT('EXM-', DATE_FORMAT(created_at, '%Y%m%d'), '-', UPPER(LEFT(MD5(RAND()), 6)))")
            ]);

        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('attempt_code')->nullable();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('attempt_number')->default(1);

            // Timing
            $table->dateTime('started_at')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->integer('time_spent_seconds')->default(0);
            $table->integer('time_remaining_seconds')->nullable();

            // Status
            $table->enum('status', [
                'not_started',
                'in_progress',
                'paused',
                'submitted',
                'auto_submitted',
                'terminated',
                'expired'
            ])->default('not_started');

            // Progress tracking
            $table->integer('current_question_index')->default(0);
            $table->integer('questions_answered')->default(0);
            $table->integer('questions_marked_for_review')->default(0);
            $table->json('question_order')->nullable();
            $table->json('options_order')->nullable();

            // Device & Network Info
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('device_info')->nullable();
            $table->json('screen_resolution')->nullable();
            $table->string('timezone')->nullable();

            // Integrity tracking
            $table->integer('tab_switch_count')->default(0);
            $table->integer('blur_event_count')->default(0);
            $table->integer('copy_paste_count')->default(0);
            $table->boolean('fullscreen_exited')->default(false);
            $table->json('violation_log')->nullable();

            // Flags
            $table->boolean('is_flagged')->default(false);
            $table->text('flag_reason')->nullable();
            $table->foreignId('flagged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('flagged_at')->nullable();

            // Termination
            $table->boolean('is_terminated')->default(false);
            $table->text('termination_reason')->nullable();
            $table->foreignId('terminated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('terminated_at')->nullable();

            $table->string('resume_token')->nullable()->unique();

            $table->timestamps();

            $table->index(['exam_id', 'user_id', 'attempt_number']);
            $table->index(['status', 'started_at']);
            $table->index('is_flagged');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};
