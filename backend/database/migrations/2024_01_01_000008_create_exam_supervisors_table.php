<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_supervisors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['supervisor', 'invigilator', 'moderator'])->default('supervisor');
            $table->boolean('can_view_live_sessions')->default(true);
            $table->boolean('can_flag_candidates')->default(true);
            $table->boolean('can_terminate_sessions')->default(false);
            $table->boolean('can_message_candidates')->default(true);
            $table->timestamps();

            $table->index(['exam_id', 'user_id']);
            $table->unique(['exam_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_supervisors');
    }
};
