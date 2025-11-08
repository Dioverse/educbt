<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'instructions_html' => 'nullable|string',
            
            'duration_minutes' => 'integer|min:1',
            'start_datetime' => 'nullable|date',
            'end_datetime' => 'nullable|date|after:start_datetime',
            'is_scheduled' => 'boolean',
            'time_per_question_seconds' => 'nullable|integer|min:1',
            
            'max_attempts' => 'integer|min:1|max:10',
            'allow_resume' => 'boolean',
            'auto_save_interval_seconds' => 'integer|min:10',
            
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'questions_per_page' => 'integer|min:1',
            
            'pass_marks' => 'nullable|numeric|min:0',
            'enable_negative_marking' => 'boolean',
            
            'result_display' => 'in:immediate,scheduled,manual',
            'result_publish_datetime' => 'nullable|date',
            'show_correct_answers' => 'boolean',
            'show_score_breakdown' => 'boolean',
            'allow_review_after_submit' => 'boolean',
            'allow_exam_paper_download' => 'boolean',
            
            'require_selfie' => 'boolean',
            'require_liveness_check' => 'boolean',
            'enable_screen_monitoring' => 'boolean',
            'enable_tab_switch_detection' => 'boolean',
            'lock_fullscreen' => 'boolean',
            'max_tab_switches_allowed' => 'nullable|integer|min:0',
            'enable_webcam_recording' => 'boolean',
            'enable_screen_recording' => 'boolean',
            
            'require_stable_connection' => 'boolean',
            'allow_offline_mode' => 'boolean',
            'allowed_devices' => 'nullable|array',
            'blocked_ips' => 'nullable|array',
            
            'subject_id' => 'nullable|exists:subjects,id',
            'grade_level_id' => 'nullable|exists:grade_levels,id',
            'status' => 'in:draft,published,active,completed,archived',
            'is_public' => 'boolean',
            'access_code' => 'nullable|string|max:20',
            
            'sections' => 'nullable|array',
            'sections.*.id' => 'nullable|exists:exam_sections,id',
            'sections.*.title' => 'required|string|max:255',
            'sections.*.description' => 'nullable|string',
            'sections.*.instructions' => 'nullable|string',
            'sections.*.duration_minutes' => 'nullable|integer|min:1',
            'sections.*.is_optional' => 'boolean',
            
            'eligibility' => 'nullable|array',
            'eligibility.*.eligibility_type' => 'required|in:all,specific_users,class,grade_level,role',
            'eligibility.*.user_id' => 'nullable|exists:users,id',
            'eligibility.*.class_id' => 'nullable|exists:classes,id',
            'eligibility.*.grade_level_id' => 'nullable|exists:grade_levels,id',
            'eligibility.*.is_exempted' => 'boolean',
            
            'supervisors' => 'nullable|array',
            'supervisors.*.user_id' => 'required|exists:users,id',
            'supervisors.*.role' => 'in:supervisor,invigilator,moderator',
            'supervisors.*.can_view_live_sessions' => 'boolean',
            'supervisors.*.can_flag_candidates' => 'boolean',
            'supervisors.*.can_terminate_sessions' => 'boolean',
            'supervisors.*.can_message_candidates' => 'boolean',
        ];
    }
}