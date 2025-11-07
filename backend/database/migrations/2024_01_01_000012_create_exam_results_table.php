<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('exam_submission_id')->constrained('exam_submissions')->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Scoring
            $table->decimal('total_marks', 10, 2)->default(0.00);
            $table->decimal('marks_obtained', 10, 2)->default(0.00);
            $table->decimal('negative_marks_deducted', 10, 2)->default(0.00);
            $table->decimal('percentage', 5, 2)->default(0.00);

            $table->json('section_wise_scores')->nullable();

            // Question breakdown
            $table->integer('correct_answers')->default(0);
            $table->integer('incorrect_answers')->default(0);
            $table->integer('unanswered')->default(0);
            $table->integer('marked_for_review')->default(0);

            // Grading
            $table->string('grade')->nullable();
            $table->enum('pass_status', ['pass', 'fail', 'pending'])->default('pending');
            $table->text('remarks')->nullable();

            // Ranking
            $table->integer('rank')->nullable();
            $table->integer('total_participants')->nullable();
            $table->decimal('percentile', 5, 2)->nullable();

            // Time analysis
            $table->integer('time_taken_seconds');
            $table->decimal('avg_time_per_question_seconds', 8, 2)->nullable();

            // Publication
            $table->boolean('is_published')->default(false);
            $table->dateTime('published_at')->nullable();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();

            // Manual review for essays
            $table->enum('review_status', ['pending', 'in_review', 'completed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();

            $table->timestamps();

            $table->index(['exam_id', 'percentage']);
            $table->index(['exam_id', 'rank']);
            $table->index(['user_id', 'exam_id']);
            $table->index('is_published');
            $table->unique('exam_attempt_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
