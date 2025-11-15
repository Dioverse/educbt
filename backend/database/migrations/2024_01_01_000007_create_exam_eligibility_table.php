<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_eligibilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->enum('eligibility_type', ['all', 'specific_users', 'class', 'grade_level', 'role'])->default('all');

            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('grade_level_id')->nullable()->constrained('grade_levels')->cascadeOnDelete();

            $table->boolean('is_exempted')->default(false);
            $table->timestamps();

            $table->index(['exam_id', 'eligibility_type']);
            $table->index('user_id');
            $table->index('class_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_eligibility');
    }
};
