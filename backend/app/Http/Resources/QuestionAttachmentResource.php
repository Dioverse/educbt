<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'context' => $this->context,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'file_url' => $this->getPublicUrl(),
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'duration' => $this->duration,
            'width' => $this->width,
            'height' => $this->height,
            'metadata' => $this->metadata,
            'display_order' => $this->display_order,
        ];
    }
}