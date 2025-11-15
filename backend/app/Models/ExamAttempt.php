<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'attempt_code',
        'exam_id',
        'user_id',
        'attempt_number',
        'started_at',
        'submitted_at',
        'expires_at',
        'time_spent_seconds',
        'time_remaining_seconds',
        'status',
        'current_question_index',
        'questions_answered',
        'questions_marked_for_review',
        'question_order',
        'options_order',
        'ip_address',
        'user_agent',
        'device_info',
        'screen_resolution',
        'timezone',
        'tab_switch_count',
        'blur_event_count',
        'copy_paste_count',
        'fullscreen_exited',
        'violation_log',
        'is_flagged',
        'flag_reason',
        'flagged_by',
        'flagged_at',
        'is_terminated',
        'termination_reason',
        'terminated_by',
        'terminated_at',
        'resume_token',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'expires_at' => 'datetime',
        'flagged_at' => 'datetime',
        'terminated_at' => 'datetime',
        'question_order' => 'array',
        'options_order' => 'array',
        'device_info' => 'array',
        'screen_resolution' => 'array',
        'violation_log' => 'array',
        'is_flagged' => 'boolean',
        'is_terminated' => 'boolean',
        'fullscreen_exited' => 'boolean',
    ];

    // Relationships
    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function proctoringEvents()
    {
        return $this->hasMany(ProctoringEvent::class);
    }

    public function isSessionActive()
    {
        return $this->proctoringSession && $this->proctoringSession->is_active;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(ExamAnswer::class);
    }

    public function submission()
    {
        return $this->hasOne(ExamSubmission::class);
    }

    public function result()
    {
        return $this->hasOne(ExamResult::class);
    }

    public function proctoringSession()
    {
        return $this->hasOne(ProctoringSession::class);
    }

    public function flaggedBy()
    {
        return $this->belongsTo(User::class, 'flagged_by');
    }

    public function terminatedBy()
    {
        return $this->belongsTo(User::class, 'terminated_by');
    }

    // Scopes
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeSubmitted($query)
    {
        return $query->whereIn('status', ['submitted', 'auto_submitted']);
    }

    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    // Helper methods
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at < now();
    }

    public function canResume()
    {
        return $this->exam->allow_resume
            && in_array($this->status, ['in_progress', 'paused'])
            && !$this->isExpired();
    }

    public function getRemainingTime()
    {
        if ($this->status !== 'in_progress') {
            return 0;
        }

        $elapsed = now()->diffInSeconds($this->started_at);
        $total = $this->exam->duration_minutes * 60;
        return max(0, $total - $elapsed);
    }
}
