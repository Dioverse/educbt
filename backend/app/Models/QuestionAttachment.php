<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'type',
        'context',
        'file_name',
        'file_path',
        'file_url',
        'mime_type',
        'file_size',
        'duration',
        'width',
        'height',
        'metadata',
        'display_order',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // Helper methods
    public function isImage()
    {
        return $this->type === 'image';
    }

    public function isAudio()
    {
        return $this->type === 'audio';
    }

    public function isVideo()
    {
        return $this->type === 'video';
    }

    public function isDocument()
    {
        return $this->type === 'document';
    }

    public function getPublicUrl()
    {
        if ($this->file_url) {
            return $this->file_url;
        }
        
        return asset('storage/' . $this->file_path);
    }
}