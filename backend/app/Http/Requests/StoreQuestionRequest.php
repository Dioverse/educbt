<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add authorization logic here
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:multiple_choice_single,multiple_choice_multiple,true_false,short_answer,numeric,essay,image_based,audio_video,match_following,drag_drop',
            'question_text' => 'required|string',
            'question_html' => 'nullable|string',
            'explanation' => 'nullable|string',
            'explanation_html' => 'nullable|string',
            
            // Subject and Topic
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            
            // Difficulty and tags
            'difficulty_level' => 'required|in:easy,medium,hard,expert',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            
            // Marks
            'marks' => 'required|numeric|min:0',
            'negative_marks' => 'nullable|numeric|min:0',
            
            // Numeric question specific
            'correct_answer_numeric' => 'required_if:type,numeric|nullable|numeric',
            'tolerance' => 'nullable|numeric|min:0',
            
            // Short answer specific
            'correct_answer_text' => 'required_if:type,short_answer|nullable|string',
            'case_sensitive' => 'boolean',
            
            // Essay specific
            'min_words' => 'nullable|integer|min:1',
            'max_words' => 'nullable|integer|min:1',
            'allow_file_upload' => 'boolean',
            'allowed_file_types' => 'nullable|array',
            'max_file_size_kb' => 'nullable|integer|min:1',
            
            // Match/Drag-drop specific
            'pairs_data' => 'required_if:type,match_following,drag_drop|nullable|array',
            
            // Options (for MCQ)
            'options' => 'required_if:type,multiple_choice_single,multiple_choice_multiple,true_false|nullable|array|min:2',
            'options.*.option_key' => 'required|string|max:10',
            'options.*.option_text' => 'required|string',
            'options.*.option_html' => 'nullable|string',
            'options.*.option_image' => 'nullable|string',
            'options.*.is_correct' => 'required|boolean',
            
            // Active status
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Question type is required',
            'question_text.required' => 'Question text is required',
            'subject_id.required' => 'Subject is required',
            'subject_id.exists' => 'Selected subject does not exist',
            'difficulty_level.required' => 'Difficulty level is required',
            'marks.required' => 'Marks are required',
            'options.required_if' => 'Options are required for multiple choice questions',
            'options.min' => 'At least 2 options are required',
            'correct_answer_numeric.required_if' => 'Correct answer is required for numeric questions',
            'correct_answer_text.required_if' => 'Correct answer is required for short answer questions',
        ];
    }
}