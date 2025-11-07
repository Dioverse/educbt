<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('exam_section_id')->nullable()->constrained('exam_sections')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();

            $table->decimal('marks', 8, 2)->nullable();
            $table->decimal('negative_marks', 8, 2)->nullable();
            $table->integer('time_limit_seconds')->nullable();

            $table->integer('display_order')->default(0);
            $table->boolean('is_mandatory')->default(true);

            $table->timestamps();

            $table->index(['exam_id', 'exam_section_id', 'display_order']);
            $table->index('question_id');
            $table->unique(['exam_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};
