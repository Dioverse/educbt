<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->text('instructions_html')->nullable();

            // Timing
            $table->integer('duration_minutes');
            $table->dateTime('start_datetime')->nullable();
            $table->dateTime('end_datetime')->nullable();
            $table->boolean('is_scheduled')->default(false);
            $table->integer('time_per_question_seconds')->nullable();

            // Attempts & Resume
            $table->integer('max_attempts')->default(1);
            $table->boolean('allow_resume')->default(true);
            $table->integer('auto_save_interval_seconds')->default(30);

            // Question Pool Settings
            $table->integer('total_questions')->default(0);
            $table->boolean('randomize_questions')->default(false);
            $table->boolean('randomize_options')->default(false);
            $table->integer('questions_per_page')->default(1);

            // Scoring
            $table->decimal('total_marks', 10, 2)->default(0.00);
            $table->decimal('pass_marks', 10, 2)->default(0.00);
            $table->boolean('enable_negative_marking')->default(false);

            // Result Display
            $table->enum('result_display', ['immediate', 'scheduled', 'manual'])->default('scheduled');
            $table->dateTime('result_publish_datetime')->nullable();
            $table->boolean('show_correct_answers')->default(false);
            $table->boolean('show_score_breakdown')->default(true);
            $table->boolean('allow_review_after_submit')->default(false);
            $table->boolean('allow_exam_paper_download')->default(false);

            // Proctoring Settings
            $table->boolean('require_selfie')->default(false);
            $table->boolean('require_liveness_check')->default(false);
            $table->boolean('enable_screen_monitoring')->default(false);
            $table->boolean('enable_tab_switch_detection')->default(true);
            $table->boolean('lock_fullscreen')->default(false);
            $table->integer('max_tab_switches_allowed')->nullable();
            $table->boolean('enable_webcam_recording')->default(false);
            $table->boolean('enable_screen_recording')->default(false);

            // Network & Device
            $table->boolean('require_stable_connection')->default(true);
            $table->boolean('allow_offline_mode')->default(false);
            $table->json('allowed_devices')->nullable();
            $table->json('blocked_ips')->nullable();

            // Metadata
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('grade_level_id')->nullable()->constrained('grade_levels')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'active', 'completed', 'archived'])->default('draft');
            $table->boolean('is_public')->default(false);
            $table->string('access_code')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'start_datetime']);
            $table->index(['subject_id', 'grade_level_id']);
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
