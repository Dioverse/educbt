<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'question_text' => $this->question_text,
            'question_html' => $this->question_html,
            'explanation' => $this->explanation,
            'explanation_html' => $this->explanation_html,
            
            // Type-specific fields
            'correct_answer_numeric' => $this->when(
                $this->type === 'numeric',
                $this->correct_answer_numeric
            ),
            'tolerance' => $this->when(
                $this->type === 'numeric',
                $this->tolerance
            ),
            'correct_answer_text' => $this->when(
                $this->type === 'short_answer',
                $this->correct_answer_text
            ),
            'case_sensitive' => $this->when(
                $this->type === 'short_answer',
                $this->case_sensitive
            ),
            'min_words' => $this->when(
                $this->type === 'essay',
                $this->min_words
            ),
            'max_words' => $this->when(
                $this->type === 'essay',
                $this->max_words
            ),
            'allow_file_upload' => $this->when(
                $this->type === 'essay',
                $this->allow_file_upload
            ),
            'allowed_file_types' => $this->when(
                $this->type === 'essay',
                $this->allowed_file_types
            ),
            'max_file_size_kb' => $this->when(
                $this->type === 'essay',
                $this->max_file_size_kb
            ),
            'pairs_data' => $this->when(
                in_array($this->type, ['match_following', 'drag_drop']),
                $this->pairs_data
            ),
            
            // Categorization
            'subject_id' => $this->subject_id,
            'subject' => $this->whenLoaded('subject', function () {
                return [
                    'id' => $this->subject->id,
                    'name' => $this->subject->name,
                    'code' => $this->subject->code,
                ];
            }),
            'topic_id' => $this->topic_id,
            'topic' => $this->whenLoaded('topic', function () {
                return [
                    'id' => $this->topic->id,
                    'name' => $this->topic->name,
                ];
            }),
            'difficulty_level' => $this->difficulty_level,
            'tags' => $this->tags ?? [],
            
            // Scoring
            'marks' => (float) $this->marks,
            'negative_marks' => (float) $this->negative_marks,
            
            // Statistics
            'times_used' => $this->times_used,
            'difficulty_index' => $this->difficulty_index,
            'discrimination_index' => $this->discrimination_index,
            
            // Options and attachments
            'options' => QuestionOptionResource::collection($this->whenLoaded('options')),
            'attachments' => QuestionAttachmentResource::collection($this->whenLoaded('attachments')),
            
            // Metadata
            'is_active' => $this->is_active,
            'is_verified' => $this->is_verified,
            'verified_at' => $this->verified_at?->toDateTimeString(),
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}