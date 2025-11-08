<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_result_id',
        'question_id',
        'selected_option_id',
        'is_correct',
        'marks_obtained',
        'time_taken_seconds',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'marks_obtained' => 'float',
        'time_taken_seconds' => 'integer',
    ];

    // Relationships
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}