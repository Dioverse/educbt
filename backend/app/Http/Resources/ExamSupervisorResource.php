<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamSupervisorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'role' => $this->role,
            'can_view_live_sessions' => $this->can_view_live_sessions,
            'can_flag_candidates' => $this->can_flag_candidates,
            'can_terminate_sessions' => $this->can_terminate_sessions,
            'can_message_candidates' => $this->can_message_candidates,
        ];
    }
}