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
        Schema::table('exam_answers', function (Blueprint $table) {
            // Check if columns don't exist before adding
            if (!Schema::hasColumn('exam_answers', 'selected_option_id')) {
                $table->unsignedBigInteger('selected_option_id')->nullable()->after('question_id');
                $table->foreign('selected_option_id')->references('id')->on('question_options')->onDelete('set null');
            }

            if (!Schema::hasColumn('exam_answers', 'selected_option_ids')) {
                $table->json('selected_option_ids')->nullable()->after('selected_option_id');
            }

            if (!Schema::hasColumn('exam_answers', 'answer_text')) {
                $table->text('answer_text')->nullable()->after('selected_option_ids');
            }

            if (!Schema::hasColumn('exam_answers', 'answer_numeric')) {
                $table->decimal('answer_numeric', 10, 2)->nullable()->after('answer_text');
            }

            if (!Schema::hasColumn('exam_answers', 'is_flagged')) {
                $table->boolean('is_flagged')->default(false)->after('answer_numeric');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_answers', function (Blueprint $table) {
            if (Schema::hasColumn('exam_answers', 'selected_option_id')) {
                $table->dropForeign(['selected_option_id']);
                $table->dropColumn('selected_option_id');
            }

            if (Schema::hasColumn('exam_answers', 'selected_option_ids')) {
                $table->dropColumn('selected_option_ids');
            }

            if (Schema::hasColumn('exam_answers', 'answer_text')) {
                $table->dropColumn('answer_text');
            }

            if (Schema::hasColumn('exam_answers', 'answer_numeric')) {
                $table->dropColumn('answer_numeric');
            }

            if (Schema::hasColumn('exam_answers', 'is_flagged')) {
                $table->dropColumn('is_flagged');
            }
        });
    }
};
