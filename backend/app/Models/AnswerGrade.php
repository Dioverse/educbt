<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class AnswerGrade extends Model
// {
//     use HasFactory;

//     protected $fillable = [
//         'exam_answer_id',
//         'rubric_id',
//         'graded_by',
//         'marks_awarded',
//         'feedback',
//         'criteria_scores',
//         'grade_status',
//         'graded_at',
//     ];

//     protected $casts = [
//         'marks_awarded' => 'decimal:2',
//         'criteria_scores' => 'array',
//         'graded_at' => 'datetime',
//     ];

//     // Relationships
//     public function examAnswer()
//     {
//         return $this->belongsTo(ExamAnswer::class);
//     }

//     public function rubric()
//     {
//         return $this->belongsTo(GradingRubric::class);
//     }

//     public function grader()
//     {
//         return $this->belongsTo(User::class, 'graded_by');
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerGrade extends Model
{
    protected $fillable = [
        'exam_answer_id',
        'rubric_id',
        'graded_by',
        'marks_awarded',
        'feedback',
        'criteria_scores',
        'grade_status',
        'graded_at',
    ];

    protected $casts = [
        'marks_awarded' => 'decimal:2',
        'criteria_scores' => 'array',
        'graded_at' => 'datetime',
    ];

    /**
     * Get the answer being graded
     */
    public function examAnswer(): BelongsTo
    {
        return $this->belongsTo(ExamAnswer::class, 'exam_answer_id');
    }

    /**
     * Get the rubric used for grading
     */
    public function rubric(): BelongsTo
    {
        return $this->belongsTo(GradingRubric::class, 'rubric_id');
    }

    /**
     * Get the grader (user who graded)
     */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }
}
