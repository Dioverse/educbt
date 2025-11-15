<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GradeLevel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function students()
    {
        return $this->hasMany(User::class)->where('role', 'student');
    }
    // Relationships
    public function exams()
    {
        return $this->hasMany(Exam::class);
    }

    public function eligibility()
    {
        return $this->hasMany(ExamEligibility::class);
    }
}
