<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProctoringEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'proctoring_session_id',
        'exam_attempt_id',
        'event_type',
        'description',
        'event_data',
        'severity',
        'question_index_at_event',
        'time_into_exam_seconds',
        'ip_address',
        'screenshot_path',
        'webcam_snapshot_path',
        'is_flagged',
        'requires_review',
        'occurred_at',
    ];

    protected $casts = [
        'event_data' => 'array',
        'is_flagged' => 'boolean',
        'requires_review' => 'boolean',
        'occurred_at' => 'datetime',
    ];

    // Relationships
    public function proctoringSession()
    {
        return $this->belongsTo(ProctoringSession::class);
    }

    public function examAttempt()
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    // Scopes
    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    public function scopeRequiresReview($query)
    {
        return $query->where('requires_review', true);
    }

    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    // Helper methods
    public function isCritical()
    {
        return $this->severity === 'critical';
    }

    public function getSeverityColor()
    {
        return [
            'low' => 'gray',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
        ][$this->severity] ?? 'gray';
    }
}
