<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamEligibility extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'eligibility_type',
        'user_id',
        'class_id',
        'grade_level_id',
        'is_exempted',
    ];

    protected $casts = [
        'is_exempted' => 'boolean',
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

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class);
    }
}