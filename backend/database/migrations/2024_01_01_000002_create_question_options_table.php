<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->string('option_key');
            $table->text('option_text');
            $table->text('option_html')->nullable();
            $table->string('option_image')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index(['question_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};
