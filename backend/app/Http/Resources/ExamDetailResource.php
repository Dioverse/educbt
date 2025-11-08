<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'instructions' => $this->instructions,
            'instructions_html' => $this->instructions_html,
            
            // Timing
            'duration_minutes' => $this->duration_minutes,
            'start_datetime' => $this->start_datetime?->toDateTimeString(),
            'end_datetime' => $this->end_datetime?->toDateTimeString(),
            'is_scheduled' => $this->is_scheduled,
            'time_per_question_seconds' => $this->time_per_question_seconds,
            
            // Attempts & Resume
            'max_attempts' => $this->max_attempts,
            'allow_resume' => $this->allow_resume,
            'auto_save_interval_seconds' => $this->auto_save_interval_seconds,
            
            // Question Pool
            'total_questions' => $this->total_questions,
            'randomize_questions' => $this->randomize_questions,
            'randomize_options' => $this->randomize_options,
            'questions_per_page' => $this->questions_per_page,
            
            // Scoring
            'total_marks' => (float) $this->total_marks,
            'pass_marks' => (float) $this->pass_marks,
            'enable_negative_marking' => $this->enable_negative_marking,
            
            // Result Display
            'result_display' => $this->result_display,
            'result_publish_datetime' => $this->result_publish_datetime?->toDateTimeString(),
            'show_correct_answers' => $this->show_correct_answers,
            'show_score_breakdown' => $this->show_score_breakdown,
            'allow_review_after_submit' => $this->allow_review_after_submit,
            'allow_exam_paper_download' => $this->allow_exam_paper_download,
            
            // Proctoring
            'require_selfie' => $this->require_selfie,
            'require_liveness_check' => $this->require_liveness_check,
            'enable_screen_monitoring' => $this->enable_screen_monitoring,
            'enable_tab_switch_detection' => $this->enable_tab_switch_detection,
            'lock_fullscreen' => $this->lock_fullscreen,
            'max_tab_switches_allowed' => $this->max_tab_switches_allowed,
            'enable_webcam_recording' => $this->enable_webcam_recording,
            'enable_screen_recording' => $this->enable_screen_recording,
            
            // Network & Device
            'require_stable_connection' => $this->require_stable_connection,
            'allow_offline_mode' => $this->allow_offline_mode,
            'allowed_devices' => $this->allowed_devices,
            'blocked_ips' => $this->blocked_ips,
            
            // Relationships
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
            
            // Sections
            'sections' => ExamSectionResource::collection($this->whenLoaded('sections')),
            
            // Questions
            'exam_questions' => ExamQuestionResource::collection($this->whenLoaded('examQuestions')),
            
            // Eligibility
            'eligibility' => ExamEligibilityResource::collection($this->whenLoaded('eligibility')),
            
            // Supervisors
            'supervisors' => ExamSupervisorResource::collection($this->whenLoaded('supervisors')),
            
            // Status
            'status' => $this->status,
            'is_public' => $this->is_public,
            'access_code' => $this->access_code,
            
            // Metadata
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}