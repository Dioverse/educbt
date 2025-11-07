<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable();
            $table->enum('type', [
                'multiple_choice_single',
                'multiple_choice_multiple',
                'true_false',
                'short_answer',
                'numeric',
                'essay',
                'image_based',
                'audio_video',
                'match_following',
                'drag_drop'
            ]);
            $table->text('question_text');
            $table->text('question_html')->nullable();
            $table->text('explanation')->nullable();
            $table->text('explanation_html')->nullable();

            // For numeric questions
            $table->decimal('correct_answer_numeric', 10, 4)->nullable();
            $table->decimal('tolerance', 10, 4)->nullable();

            // For short answer questions
            $table->text('correct_answer_text')->nullable();
            $table->boolean('case_sensitive')->default(false);

            // For essay questions
            $table->integer('min_words')->nullable();
            $table->integer('max_words')->nullable();
            $table->boolean('allow_file_upload')->default(false);
            $table->json('allowed_file_types')->nullable();
            $table->integer('max_file_size_kb')->nullable();

            // For match/drag-drop
            $table->json('pairs_data')->nullable();

            // Categorization
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->enum('difficulty_level', ['easy', 'medium', 'hard', 'expert'])->default('medium');
            $table->json('tags')->nullable();

            // Scoring
            $table->decimal('marks', 8, 2)->default(1.00);
            $table->decimal('negative_marks', 8, 2)->default(0.00);

            // Usage statistics
            $table->integer('times_used')->default(0);
            $table->decimal('difficulty_index', 5, 4)->nullable();
            $table->decimal('discrimination_index', 5, 4)->nullable();

            // Metadata
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['subject_id', 'difficulty_level']);
            $table->index(['is_active', 'is_verified']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
