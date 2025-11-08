<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'title',
        'description',
        'instructions',
        'duration_minutes',
        'total_questions',
        'total_marks',
        'display_order',
        'is_optional',
    ];

    protected $casts = [
        'is_optional' => 'boolean',
        'total_marks' => 'decimal:2',
    ];

    // Relationships
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function examQuestions()
    {
        return $this->hasMany(ExamQuestion::class)->orderBy('display_order');
    }

    // Helper methods
    public function calculateTotalMarks()
    {
        return $this->examQuestions()->sum('marks');
    }

    public function calculateTotalQuestions()
    {
        return $this->examQuestions()->count();
    }
}