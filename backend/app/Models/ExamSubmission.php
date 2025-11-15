<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'exam_id',
        'user_id',
        'submitted_at',
        'submission_type',
        'ip_address',
        'device_info',
        'total_questions',
        'questions_attempted',
        'questions_unanswered',
        'time_taken_seconds',
        'submission_hash',
        'integrity_data',
        'integrity_verified',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'device_info' => 'array',
        'integrity_data' => 'array',
        'integrity_verified' => 'boolean',
    ];

    // Relationships
    public function examAttempt()
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function result()
    {
        return $this->hasOne(ExamResult::class);
    }

    // Helper methods
    public function getCompletionPercentage()
    {
        if ($this->total_questions == 0) {
            return 0;
        }
        return ($this->questions_attempted / $this->total_questions) * 100;
    }
}
