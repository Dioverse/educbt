<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SelfieCapture extends Model
{
    use HasFactory;

    protected $fillable = [
        'proctoring_session_id',
        'exam_attempt_id',
        'capture_type',
        'image_path',
        'face_detected',
        'face_count',
        'face_match_score',
        'analysis_data',
        'flagged',
        'flag_reason',
    ];

    protected $casts = [
        'face_detected' => 'boolean',
        'analysis_data' => 'array',
        'flagged' => 'boolean',
    ];

    public function proctoringSession(): BelongsTo
    {
        return $this->belongsTo(ProctoringSession::class);
    }

    public function examAttempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class);
    }
}
