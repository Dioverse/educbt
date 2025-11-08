<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'option_key' => $this->option_key,
            'option_text' => $this->option_text,
            'option_html' => $this->option_html,
            'option_image' => $this->option_image,
            'is_correct' => $this->is_correct,
            'display_order' => $this->display_order,
        ];
    }
}