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
        Schema::create('rubric_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rubric_id')->constrained('grading_rubrics')->cascadeOnDelete();
            $table->string('criterion_name');
            $table->text('description')->nullable();
            $table->decimal('max_points', 8, 2);
            $table->integer('weight_percentage')->default(0);
            $table->integer('display_order')->default(0);
            $table->json('performance_levels')->nullable(); // Excellent, Good, Fair, Poor
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rubric_criteria');
    }
};
