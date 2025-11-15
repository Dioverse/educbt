<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\RubricCriterionStore;

class RubricCriterion extends Model
{
    use HasFactory;

    protected $fillable = [
        'rubric_id',
        'criterion_name',
        'description',
        'max_points',
        'weight_percentage',
        'display_order',
        'performance_levels',
    ];

    protected $casts = [
        'max_points' => 'decimal:2',
        'performance_levels' => 'array',
    ];

    // Relationships
    public function rubric()
    {
        return $this->belongsTo(GradingRubric::class, 'rubric_id');
    }
}
