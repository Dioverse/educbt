<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Topic extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'subject_id',
        'name',
        'description',
        'parent_topic_id',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function parentTopic()
    {
        return $this->belongsTo(Topic::class, 'parent_topic_id');
    }

    public function childTopics()
    {
        return $this->hasMany(Topic::class, 'parent_topic_id')->orderBy('display_order');
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRootTopics($query)
    {
        return $query->whereNull('parent_topic_id');
    }
}