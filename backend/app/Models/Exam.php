<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'title',
        'description',
        'instructions',
        'instructions_html',
        'duration_minutes',
        'start_datetime',
        'end_datetime',
        'is_scheduled',
        'time_per_question_seconds',
        'max_attempts',
        'allow_resume',
        'auto_save_interval_seconds',
        'total_questions',
        'randomize_questions',
        'randomize_options',
        'questions_per_page',
        'total_marks',
        'pass_marks',
        'enable_negative_marking',
        'result_display',
        'result_publish_datetime',
        'show_correct_answers',
        'show_score_breakdown',
        'allow_review_after_submit',
        'allow_exam_paper_download',
        'require_selfie',
        'require_liveness_check',
        'enable_screen_monitoring',
        'enable_tab_switch_detection',
        'lock_fullscreen',
        'max_tab_switches_allowed',
        'enable_webcam_recording',
        'enable_screen_recording',
        'require_stable_connection',
        'allow_offline_mode',
        'allowed_devices',
        'blocked_ips',
        'subject_id',
        'grade_level_id',
        'created_by',
        'updated_by',
        'status',
        'is_public',
        'access_code',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'result_publish_datetime' => 'datetime',
        'is_scheduled' => 'boolean',
        'allow_resume' => 'boolean',
        'randomize_questions' => 'boolean',
        'randomize_options' => 'boolean',
        'enable_negative_marking' => 'boolean',
        'show_correct_answers' => 'boolean',
        'show_score_breakdown' => 'boolean',
        'allow_review_after_submit' => 'boolean',
        'allow_exam_paper_download' => 'boolean',
        'require_selfie' => 'boolean',
        'require_liveness_check' => 'boolean',
        'enable_screen_monitoring' => 'boolean',
        'enable_tab_switch_detection' => 'boolean',
        'lock_fullscreen' => 'boolean',
        'enable_webcam_recording' => 'boolean',
        'enable_screen_recording' => 'boolean',
        'require_stable_connection' => 'boolean',
        'allow_offline_mode' => 'boolean',
        'is_public' => 'boolean',
        'allowed_devices' => 'array',
        'blocked_ips' => 'array',
        'total_marks' => 'decimal:2',
        'pass_marks' => 'decimal:2',
    ];

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function sections()
    {
        return $this->hasMany(ExamSection::class)->orderBy('display_order');
    }

    public function examQuestions()
    {
        return $this->hasMany(ExamQuestion::class)->orderBy('display_order');
    }

    public function eligibility()
    {
        return $this->hasMany(ExamEligibility::class);
    }

    public function supervisors()
    {
        return $this->hasMany(ExamSupervisor::class);
    }

    public function attempts()
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function results()
    {
        return $this->hasMany(ExamResult::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePublished($query)
    {
        return $query->whereIn('status', ['published', 'active']);
    }

    public function scopeScheduled($query)
    {
        return $query->where('is_scheduled', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_datetime', '>', now());
    }

    public function scopeOngoing($query)
    {
        return $query->where('start_datetime', '<=', now())
            ->where('end_datetime', '>=', now());
    }

    public function scopeCompleted($query)
    {
        return $query->where('end_datetime', '<', now());
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isScheduled()
    {
        return $this->is_scheduled && $this->start_datetime && $this->end_datetime;
    }

    public function isUpcoming()
    {
        return $this->isScheduled() && $this->start_datetime > now();
    }

    public function isOngoing()
    {
        return $this->isScheduled() 
            && $this->start_datetime <= now() 
            && $this->end_datetime >= now();
    }

    public function hasEnded()
    {
        return $this->isScheduled() && $this->end_datetime < now();
    }

    public function canUserAttempt($userId)
    {
        // Check eligibility
        $eligibility = $this->eligibility()
            ->where(function($query) use ($userId) {
                $query->where('eligibility_type', 'all')
                    ->orWhere('user_id', $userId);
            })
            ->where('is_exempted', false)
            ->exists();

        if (!$eligibility) {
            return false;
        }

        // Check max attempts
        $attemptCount = $this->attempts()
            ->where('user_id', $userId)
            ->whereIn('status', ['submitted', 'auto_submitted'])
            ->count();

        return $attemptCount < $this->max_attempts;
    }

    public function calculateTotalMarks()
    {
        return $this->examQuestions()->sum('marks');
    }

    public function calculateTotalQuestions()
    {
        return $this->examQuestions()->count();
    }

    // Generate unique code
    public static function generateCode()
    {
        $lastExam = self::orderBy('id', 'desc')->first();
        $number = $lastExam ? intval(substr($lastExam->code, 3)) + 1 : 1;
        return 'EX-' . date('Y') . '-' . str_pad($number, 3, '0', STR_PAD_LEFT);
    }
}