<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('total_questions')->default(0);
            $table->decimal('total_marks', 10, 2)->default(0.00);
            $table->integer('display_order')->default(0);
            $table->boolean('is_optional')->default(false);
            $table->timestamps();

            $table->index(['exam_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_sections');
    }
};
