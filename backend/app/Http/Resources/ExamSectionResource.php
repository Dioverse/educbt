<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'instructions' => $this->instructions,
            'duration_minutes' => $this->duration_minutes,
            'total_questions' => $this->total_questions,
            'total_marks' => (float) $this->total_marks,
            'display_order' => $this->display_order,
            'is_optional' => $this->is_optional,
            'exam_questions' => ExamQuestionResource::collection($this->whenLoaded('examQuestions')),
        ];
    }
}