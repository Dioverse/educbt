<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSupervisor extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'user_id',
        'role',
        'can_view_live_sessions',
        'can_flag_candidates',
        'can_terminate_sessions',
        'can_message_candidates',
    ];

    protected $casts = [
        'can_view_live_sessions' => 'boolean',
        'can_flag_candidates' => 'boolean',
        'can_terminate_sessions' => 'boolean',
        'can_message_candidates' => 'boolean',
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
}