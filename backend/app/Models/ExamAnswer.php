<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Relations\HasOne;

// class ExamAnswer extends Model
// {
//     use HasFactory;

//     protected $fillable = [
//         'exam_attempt_id',
//         'question_id',
//         'exam_question_id',
//         'selected_option_ids',
//         'text_answer',
//         'text_answer_html',
//         'numeric_answer',
//         'match_pairs',
//         'drag_drop_positions',
//         'uploaded_file_path',
//         'uploaded_file_name',
//         'uploaded_file_size',
//         'uploaded_file_mime',
//         'is_marked_for_review',
//         'is_answered',
//         'time_spent_seconds',
//         'answer_change_count',
//         'marks_obtained',
//         'is_correct',
//         'grading_status',
//         'graded_by',
//         'graded_at',
//         'grader_feedback',
//         'first_answered_at',
//         'last_updated_at',
//     ];

//     protected $casts = [
//         'selected_option_ids' => 'array',
//         'match_pairs' => 'array',
//         'drag_drop_positions' => 'array',
//         'is_marked_for_review' => 'boolean',
//         'is_answered' => 'boolean',
//         'is_correct' => 'boolean',
//         'marks_obtained' => 'decimal:2',
//         'numeric_answer' => 'decimal:4',
//         'graded_at' => 'datetime',
//         'first_answered_at' => 'datetime',
//         'last_updated_at' => 'datetime',
//     ];

//     // Relationships
//     public function result(): HasOne
//     {
//         return $this->hasOne(ExamResult::class, 'exam_attempt_id');
//     }
//     public function examAttempt()
//     {
//         return $this->belongsTo(ExamAttempt::class);
//     }

//     public function question()
//     {
//         return $this->belongsTo(Question::class);
//     }

//     public function examQuestion()
//     {
//         return $this->belongsTo(ExamQuestion::class);
//     }

//     public function grader()
//     {
//         return $this->belongsTo(User::class, 'graded_by');
//     }

//     // Scopes
//     public function scopeAnswered($query)
//     {
//         return $query->where('is_answered', true);
//     }

//     public function scopeUnanswered($query)
//     {
//         return $query->where('is_answered', false);
//     }

//     public function scopeMarkedForReview($query)
//     {
//         return $query->where('is_marked_for_review', true);
//     }

//     public function scopePendingGrading($query)
//     {
//         return $query->where('grading_status', 'pending');
//     }

//     // Helper methods
//     public function needsManualGrading()
//     {
//         return in_array($this->question->type, ['essay', 'short_answer'])
//             && $this->grading_status === 'pending';
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ExamAnswer extends Model
{
    protected $fillable = [
        'exam_attempt_id',
        'exam_question_id',
        'question_id',
        'answer_text',
        'selected_option_id',
        'file_path',
        'marks_obtained',
        'is_correct',
        'is_answered',
        'grading_status',
        'graded_by',
        'graded_at',
        'grader_feedback',
        'answered_at',
        'time_spent_seconds',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'is_correct' => 'boolean',
        'is_answered' => 'boolean',
        'graded_at' => 'datetime',
        'answered_at' => 'datetime',
    ];

    /**
     * Get the exam attempt
     */
    public function examAttempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    /**
     * Get the exam question
     */
    public function examQuestion(): BelongsTo
    {
        return $this->belongsTo(ExamQuestion::class);
    }

    /**
     * Get the question bank question
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the selected option
     */
    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }

    /**
     * Get the grader
     */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Get the detailed grade
     */
    public function grade(): HasOne
    {
        return $this->hasOne(AnswerGrade::class);
    }
}
