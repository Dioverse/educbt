<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            
            // Timing
            'duration_minutes' => $this->duration_minutes,
            'start_datetime' => $this->start_datetime?->toDateTimeString(),
            'end_datetime' => $this->end_datetime?->toDateTimeString(),
            'is_scheduled' => $this->is_scheduled,
            
            // Basic stats
            'total_questions' => $this->total_questions,
            'total_marks' => (float) $this->total_marks,
            'pass_marks' => (float) $this->pass_marks,
            'max_attempts' => $this->max_attempts,
            
            // Subject and Grade
            'subject_id' => $this->subject_id,
            'subject' => $this->whenLoaded('subject', function () {
                return [
                    'id' => $this->subject->id,
                    'name' => $this->subject->name,
                    'code' => $this->subject->code,
                ];
            }),
            'grade_level_id' => $this->grade_level_id,
            'grade_level' => $this->whenLoaded('gradeLevel', function () {
                return [
                    'id' => $this->gradeLevel->id,
                    'name' => $this->gradeLevel->name,
                    'level' => $this->gradeLevel->level,
                ];
            }),
            
            // Status
            'status' => $this->status,
            'is_public' => $this->is_public,
            
            // Counts
            'attempts_count' => $this->when(isset($this->attempts_count), $this->attempts_count),
            'sections_count' => $this->when(isset($this->sections), $this->sections->count()),
            
            // Metadata
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            
            // Helper flags
            'is_upcoming' => $this->isUpcoming(),
            'is_ongoing' => $this->isOngoing(),
            'has_ended' => $this->hasEnded(),
        ];
    }
}