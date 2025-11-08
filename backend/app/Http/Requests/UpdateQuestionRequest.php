<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'in:multiple_choice_single,multiple_choice_multiple,true_false,short_answer,numeric,essay,image_based,audio_video,match_following,drag_drop',
            'question_text' => 'string',
            'question_html' => 'nullable|string',
            'explanation' => 'nullable|string',
            'explanation_html' => 'nullable|string',
            
            'subject_id' => 'exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            
            'difficulty_level' => 'in:easy,medium,hard,expert',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            
            'marks' => 'numeric|min:0',
            'negative_marks' => 'nullable|numeric|min:0',
            
            'correct_answer_numeric' => 'nullable|numeric',
            'tolerance' => 'nullable|numeric|min:0',
            
            'correct_answer_text' => 'nullable|string',
            'case_sensitive' => 'boolean',
            
            'min_words' => 'nullable|integer|min:1',
            'max_words' => 'nullable|integer|min:1',
            'allow_file_upload' => 'boolean',
            'allowed_file_types' => 'nullable|array',
            'max_file_size_kb' => 'nullable|integer|min:1',
            
            'pairs_data' => 'nullable|array',
            
            'options' => 'nullable|array|min:2',
            'options.*.option_key' => 'required|string|max:10',
            'options.*.option_text' => 'required|string',
            'options.*.option_html' => 'nullable|string',
            'options.*.option_image' => 'nullable|string',
            'options.*.is_correct' => 'required|boolean',
            
            'is_active' => 'boolean',
        ];
    }
}