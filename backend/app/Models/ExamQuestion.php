<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'exam_section_id',
        'question_id',
        'marks',
        'negative_marks',
        'time_limit_seconds',
        'display_order',
        'is_mandatory',
    ];

    protected $casts = [
        'marks' => 'decimal:2',
        'negative_marks' => 'decimal:2',
        'is_mandatory' => 'boolean',
    ];

    // Relationships
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function examSection()
    {
        return $this->belongsTo(ExamSection::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}