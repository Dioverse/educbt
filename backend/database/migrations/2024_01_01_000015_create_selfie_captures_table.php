<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // public function up(): void
    // {
    //     Schema::create('selfie_captures', function (Blueprint $table) {
    //         $table->id();
    //         $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
    //         $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

    //         $table->enum('capture_type', ['pre_exam', 'during_exam', 'random_check', 'flagged_event'])->default('pre_exam');
    //         $table->timestamp('captured_at');

    //         // Image storage
    //         $table->string('image_path');
    //         $table->string('image_url')->nullable();
    //         $table->integer('image_size')->nullable();
    //         $table->string('image_hash')->nullable();

    //         // Face detection results
    //         $table->boolean('face_detected')->default(false);
    //         $table->integer('face_count')->default(0);
    //         $table->decimal('face_confidence', 5, 4)->nullable();
    //         $table->json('face_landmarks')->nullable();
    //         $table->json('face_attributes')->nullable();

    //         // Liveness check
    //         $table->boolean('liveness_check_passed')->nullable();
    //         $table->decimal('liveness_score', 5, 4)->nullable();
    //         $table->json('liveness_data')->nullable();

    //         // Face matching
    //         $table->boolean('match_attempted')->default(false);
    //         $table->boolean('match_successful')->nullable();
    //         $table->decimal('match_confidence', 5, 4)->nullable();
    //         $table->string('matched_against_image')->nullable();

    //         // Verification status
    //         $table->enum('verification_status', ['pending', 'verified', 'failed', 'requires_manual_review'])->default('pending');
    //         $table->text('verification_notes')->nullable();
    //         $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
    //         $table->dateTime('verified_at')->nullable();

    //         $table->boolean('is_flagged')->default(false);
    //         $table->text('flag_reason')->nullable();

    //         $table->timestamps();

    //         $table->index(['exam_attempt_id', 'capture_type']);
    //         $table->index('verification_status');
    //         $table->index('is_flagged');
    //     });
    // }
    public function up(): void
    {
        Schema::create('selfie_captures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proctoring_session_id')->constrained('proctoring_sessions')->cascadeOnDelete();
            $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();

            $table->enum('capture_type', ['initial', 'periodic', 'random', 'flagged'])->default('periodic');
            $table->string('image_path');

            $table->boolean('face_detected')->nullable();
            $table->integer('face_count')->nullable();
            $table->decimal('face_match_score', 5, 2)->nullable();
            $table->json('analysis_data')->nullable();

            $table->boolean('flagged')->default(false);
            $table->string('flag_reason')->nullable();

            $table->timestamps();

            $table->index(['proctoring_session_id', 'capture_type']);
            $table->index(['exam_attempt_id', 'flagged']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('selfie_captures');
    }
};
