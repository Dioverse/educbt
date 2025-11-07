<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->dateTime('submitted_at');
            $table->enum('submission_type', ['manual', 'auto', 'forced'])->default('manual');
            $table->string('ip_address')->nullable();
            $table->json('device_info')->nullable();

            // Snapshot at time of submission
            $table->integer('total_questions');
            $table->integer('questions_attempted');
            $table->integer('questions_unanswered');
            $table->integer('time_taken_seconds');

            // Integrity check
            $table->string('submission_hash')->unique();
            $table->json('integrity_data')->nullable();
            $table->boolean('integrity_verified')->default(true);

            $table->timestamps();

            $table->index(['exam_id', 'user_id', 'submitted_at']);
            $table->unique('exam_attempt_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_submissions');
    }
};
