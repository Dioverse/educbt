<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProctoringSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'exam_id',
        'user_id',
        'session_started_at',
        'session_ended_at',
        'status',
        'device_fingerprint',
        'ip_address',
        'network_info',
        'browser',
        'os',
        'screen_info',
        'connection_status',
        'disconnection_count',
        'disconnection_log',
        'last_activity_at',
        'idle_time_seconds',
        'active_time_seconds',
        'total_violations',
        'violation_summary',
        'screen_recording_path',
        'webcam_recording_path',
        'recording_duration_seconds',
        'supervisor_notes',
        'supervisor_messages',
    ];

    protected $casts = [
        'session_started_at' => 'datetime',
        'session_ended_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'device_fingerprint' => 'array',
        'network_info' => 'array',
        'screen_info' => 'array',
        'disconnection_log' => 'array',
        'violation_summary' => 'array',
        'supervisor_notes' => 'array',
        'supervisor_messages' => 'array',
    ];

    // Relationships
    public function examAttempt()
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function events()
    {
        return $this->hasMany(ProctoringEvent::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWithViolations($query)
    {
        return $query->where('total_violations', '>', 0);
    }

    // Helper methods
    public function getDuration()
    {
        if (!$this->session_ended_at) {
            return now()->diffInSeconds($this->session_started_at);
        }
        return $this->session_ended_at->diffInSeconds($this->session_started_at);
    }
}
