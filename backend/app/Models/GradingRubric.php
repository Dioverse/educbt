<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GradingRubric extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'subject_id',
        'question_type',
        'max_score',
        'is_default',
        'created_by',
    ];

    protected $casts = [
        'max_score' => 'decimal:2',
        'is_default' => 'boolean',
    ];

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function criteria()
    {
        return $this->hasMany(RubricCriterion::class, 'rubric_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function answerGrades()
    {
        return $this->hasMany(AnswerGrade::class, 'rubric_id');
    }
}
