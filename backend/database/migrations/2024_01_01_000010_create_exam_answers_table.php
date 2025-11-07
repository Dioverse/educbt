<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('exam_question_id')->constrained('exam_questions')->cascadeOnDelete();

            // Answer storage based on question type
            $table->json('selected_option_ids')->nullable();
            $table->text('text_answer')->nullable();
            $table->text('text_answer_html')->nullable();
            $table->decimal('numeric_answer', 10, 4)->nullable();
            $table->json('match_pairs')->nullable();
            $table->json('drag_drop_positions')->nullable();

            // File uploads for essay questions
            $table->string('uploaded_file_path')->nullable();
            $table->string('uploaded_file_name')->nullable();
            $table->integer('uploaded_file_size')->nullable();
            $table->string('uploaded_file_mime')->nullable();

            // Metadata
            $table->boolean('is_marked_for_review')->default(false);
            $table->boolean('is_answered')->default(false);
            $table->integer('time_spent_seconds')->default(0);
            $table->integer('answer_change_count')->default(0);

            // Scoring
            $table->decimal('marks_obtained', 8, 2)->nullable();
            $table->boolean('is_correct')->nullable();
            $table->enum('grading_status', ['pending', 'auto_graded', 'manually_graded'])->default('pending');
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('graded_at')->nullable();
            $table->text('grader_feedback')->nullable();

            // Timing
            $table->dateTime('first_answered_at')->nullable();
            $table->dateTime('last_updated_at')->nullable();

            $table->timestamps();

            $table->index(['exam_attempt_id', 'question_id']);
            $table->index('grading_status');
            $table->unique(['exam_attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_answers');
    }
};
