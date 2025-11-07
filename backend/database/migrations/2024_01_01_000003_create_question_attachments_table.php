<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->enum('type', ['image', 'audio', 'video', 'document']);
            $table->enum('context', ['question', 'option', 'explanation']);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_url')->nullable();
            $table->string('mime_type');
            $table->integer('file_size');
            $table->integer('duration')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['question_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_attachments');
    }
};
