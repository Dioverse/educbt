<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'type',
        'question_text',
        'question_html',
        'explanation',
        'explanation_html',
        'correct_answer_numeric',
        'tolerance',
        'correct_answer_text',
        'case_sensitive',
        'min_words',
        'max_words',
        'allow_file_upload',
        'allowed_file_types',
        'max_file_size_kb',
        'pairs_data',
        'subject_id',
        'topic_id',
        'difficulty_level',
        'tags',
        'marks',
        'negative_marks',
        'times_used',
        'difficulty_index',
        'discrimination_index',
        'created_by',
        'updated_by',
        'is_active',
        'is_verified',
        'verified_at',
        'verified_by',
    ];

    protected $casts = [
        'tags' => 'array',
        'allowed_file_types' => 'array',
        'pairs_data' => 'array',
        'case_sensitive' => 'boolean',
        'allow_file_upload' => 'boolean',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'marks' => 'decimal:2',
        'negative_marks' => 'decimal:2',
        'correct_answer_numeric' => 'decimal:4',
        'tolerance' => 'decimal:4',
        'difficulty_index' => 'decimal:4',
        'discrimination_index' => 'decimal:4',
    ];

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class)->orderBy('display_order');
    }

    public function attachments()
    {
        return $this->hasMany(QuestionAttachment::class)->orderBy('display_order');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function examQuestions()
    {
        return $this->hasMany(ExamQuestion::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function scopeByTopic($query, $topicId)
    {
        return $query->where('topic_id', $topicId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('question_text', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('explanation', 'like', "%{$search}%");
        });
    }

    // Helper methods
    public function isMcq()
    {
        return in_array($this->type, ['multiple_choice_single', 'multiple_choice_multiple']);
    }

    public function requiresManualGrading()
    {
        return in_array($this->type, ['essay', 'short_answer']);
    }

    public function hasCorrectAnswer()
    {
        if ($this->isMcq()) {
            return $this->options()->where('is_correct', true)->exists();
        }
        
        if ($this->type === 'numeric') {
            return !is_null($this->correct_answer_numeric);
        }
        
        if ($this->type === 'short_answer') {
            return !is_null($this->correct_answer_text);
        }
        
        return true;
    }

    // Generate unique code
    public static function generateCode()
    {
        $lastQuestion = self::orderBy('id', 'desc')->first();
        $number = $lastQuestion ? intval(substr($lastQuestion->code, 2)) + 1 : 1;
        return 'Q-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }
}