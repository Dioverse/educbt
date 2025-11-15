<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'exam_submission_id',
        'exam_id',
        'user_id',
        'total_marks',
        'marks_obtained',
        'negative_marks_deducted',
        'percentage',
        'section_wise_scores',
        'correct_answers',
        'incorrect_answers',
        'unanswered',
        'marked_for_review',
        'grade',
        'pass_status',
        'remarks',
        'rank',
        'total_participants',
        'percentile',
        'time_taken_seconds',
        'avg_time_per_question_seconds',
        'is_published',
        'published_at',
        'published_by',
        'review_status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'total_marks' => 'decimal:2',
        'marks_obtained' => 'decimal:2',
        'negative_marks_deducted' => 'decimal:2',
        'percentage' => 'decimal:2',
        'section_wise_scores' => 'array',
        'correct_answers' => 'integer',
        'incorrect_answers' => 'integer',
        'unanswered' => 'integer',
        'marked_for_review' => 'integer',
        'rank' => 'integer',
        'total_participants' => 'integer',
        'percentile' => 'decimal:2',
        'time_taken_seconds' => 'integer',
        'avg_time_per_question_seconds' => 'decimal:2',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    // protected $casts = [
    //     'section_wise_scores' => 'array',
    //     'total_marks' => 'decimal:2',
    //     'marks_obtained' => 'decimal:2',
    //     'negative_marks_deducted' => 'decimal:2',
    //     'percentage' => 'decimal:2',
    //     'percentile' => 'decimal:2',
    //     'avg_time_per_question_seconds' => 'decimal:2',
    //     'is_published' => 'boolean',
    //     'published_at' => 'datetime',
    //     'reviewed_at' => 'datetime',
    // ];

    // Relationships
    public function examAttempt()
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    public function examSubmission()
    {
        return $this->belongsTo(ExamSubmission::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopePassed($query)
    {
        return $query->where('pass_status', 'pass');
    }

    public function scopeFailed($query)
    {
        return $query->where('pass_status', 'fail');
    }

    // Helper methods
    public function hasPassed()
    {
        return $this->pass_status === 'pass';
    }

    public function getGradeColor()
    {
        if ($this->percentage >= 80) return 'green';
        if ($this->percentage >= 60) return 'blue';
        if ($this->percentage >= 40) return 'yellow';
        return 'red';
    }
}
