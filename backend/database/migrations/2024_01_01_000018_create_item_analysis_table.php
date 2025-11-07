<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_analysis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();

            // Usage statistics
            $table->integer('times_presented')->default(0);
            $table->integer('times_answered')->default(0);
            $table->integer('times_correct')->default(0);
            $table->integer('times_incorrect')->default(0);
            $table->integer('times_skipped')->default(0);

            // Difficulty metrics
            $table->decimal('difficulty_index', 5, 4)->nullable();
            $table->enum('difficulty_level', ['very_easy', 'easy', 'medium', 'hard', 'very_hard'])->nullable();

            // Discrimination metrics
            $table->decimal('discrimination_index', 5, 4)->nullable();
            $table->decimal('upper_group_correct_pct', 5, 4)->nullable();
            $table->decimal('lower_group_correct_pct', 5, 4)->nullable();
            $table->enum('discrimination_quality', ['excellent', 'good', 'fair', 'poor', 'negative'])->nullable();

            // Distractor analysis
            $table->json('option_selection_counts')->nullable();
            $table->json('option_selection_percentages')->nullable();
            $table->json('distractor_effectiveness')->nullable();

            // Time analysis
            $table->decimal('avg_time_spent_seconds', 8, 2)->nullable();
            $table->decimal('median_time_spent_seconds', 8, 2)->nullable();
            $table->integer('min_time_spent_seconds')->nullable();
            $table->integer('max_time_spent_seconds')->nullable();

            // Reliability contribution
            $table->decimal('item_total_correlation', 5, 4)->nullable();
            $table->decimal('cronbach_alpha_if_deleted', 5, 4)->nullable();

            // Recommendations
            $table->text('analysis_notes')->nullable();
            $table->json('improvement_suggestions')->nullable();
            $table->boolean('flagged_for_review')->default(false);
            $table->text('flag_reason')->nullable();

            $table->dateTime('last_calculated_at')->nullable();
            $table->integer('sample_size')->default(0);

            $table->timestamps();

            $table->index(['exam_id', 'difficulty_index']);
            $table->index(['exam_id', 'discrimination_index']);
            $table->index('flagged_for_review');
            $table->unique(['exam_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_analysis');
    }
};
