<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('answer_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_answer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rubric_id')->nullable()->constrained('grading_rubrics')->nullOnDelete();
            $table->foreignId('graded_by')->constrained('users')->cascadeOnDelete();
            $table->decimal('marks_awarded', 8, 2);
            $table->text('feedback')->nullable();
            $table->json('criteria_scores')->nullable(); // Scores per criterion
            $table->enum('grade_status', ['draft', 'final'])->default('final');
            $table->timestamp('graded_at');
            $table->timestamps();

            $table->unique('exam_answer_id');
            $table->index('rubric_id');
            $table->index('graded_by');
            $table->index('grade_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answer_grades');
    }
};
