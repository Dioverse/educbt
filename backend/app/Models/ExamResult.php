<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;


/**
 * App\Models\ExamResult
 *
 * @property int $id
 * @property int|null $exam_id
 * @property int|null $user_id
 * @property float|null $score
 * @property float|null $max_score
 * @property float|null $percentage
 * @property string|null $grade
 * @property bool $passed
 * @property array|null $meta
 * @property \Illuminate\Support\Carbon|null $started_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 */
class ExamResult extends Model
{

    protected $table = 'exam_results';

    protected $fillable = [
        'exam_id',
        'user_id',
        'score',
        'max_score',
        'percentage',
        'grade',
        'passed',
        'started_at',
        'completed_at',
        'meta',
    ];

    protected $casts = [
        'score' => 'float',
        'max_score' => 'float',
        'percentage' => 'float',
        'passed' => 'boolean',
        'meta' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /*
     * Relationships
     */

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class, 'exam_result_id');
    }

    /*
     * Scopes
     */

    public function scopePassed($query)
    {
        return $query->where('passed', true);
    }

    public function scopeOfUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /*
     * Helpers
     */

    /**
     * Recalculate percentage, grade and passed flag from score / max_score.
     * Call and save when you update score/max_score.
     */
    public function recalculate(): self
    {
        if ($this->max_score > 0 && $this->score !== null) {
            $this->percentage = ($this->score / $this->max_score) * 100;
            $this->grade = $this->determineGrade($this->percentage);
            $this->passed = $this->percentage >= 50; // default pass threshold
        } else {
            $this->percentage = null;
            $this->grade = null;
            $this->passed = false;
        }

        return $this;
    }

    protected function determineGrade(float $percentage): string
    {
        // Simple grade mapping — adjust to your rules
        if ($percentage >= 90) {
            return 'A';
        }
        if ($percentage >= 80) {
            return 'B';
        }
        if ($percentage >= 70) {
            return 'C';
        }
        if ($percentage >= 60) {
            return 'D';
        }
        return 'F';
    }

    /**
     * Returns a short human readable identifier for this result.
     */
    public function getReferenceAttribute(): string
    {
        return 'ER-' . Str::upper(Str::random(6)) . '-' . $this->id;
    }
}