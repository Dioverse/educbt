<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'exam_id' => $this->exam_id,
            'exam_section_id' => $this->exam_section_id,
            'question_id' => $this->question_id,
            'marks' => (float) ($this->marks ?? $this->question->marks),
            'negative_marks' => (float) ($this->negative_marks ?? $this->question->negative_marks),
            'time_limit_seconds' => $this->time_limit_seconds,
            'display_order' => $this->display_order,
            'is_mandatory' => $this->is_mandatory,
            'question' => new QuestionResource($this->whenLoaded('question')),
        ];
    }
}