<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ExamController extends Controller
{
    /**
     * Get all exams
     */
    public function index(Request $request): JsonResponse
    {
        $query = Exam::with(['subject', 'creator']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by subject
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $exams = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $exams,
        ]);
    }

    /**
     * Get single exam with full details
     */
    public function show(int $id): JsonResponse
    {
        $exam = Exam::with([
            'subject',
            'creator',
            'examQuestions.question.options',
            'examQuestions.question.subject',
            'examQuestions.question.topic',
        ])->findOrFail($id);

        // Transform exam questions to include question details
        $exam->questions = $exam->examQuestions->map(function ($examQuestion) {
            return [
                'id' => $examQuestion->question->id,
                'question_text' => $examQuestion->question->question_text,
                'type' => $examQuestion->question->type,
                'marks' => $examQuestion->marks,
                'negative_marks' => $examQuestion->negative_marks,
                'display_order' => $examQuestion->display_order,
                'is_mandatory' => $examQuestion->is_mandatory,
                'options' => $examQuestion->question->options,
                'subject' => $examQuestion->question->subject,
                'topic' => $examQuestion->question->topic,
                'difficulty_level' => $examQuestion->question->difficulty_level,
            ];
        })->sortBy('display_order')->values();

        return response()->json([
            'success' => true,
            'data' => $exam,
        ]);
    }

    /**
     * Create new exam
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'duration_minutes' => 'required|integer|min:1',
            'total_marks' => 'required|numeric|min:0',
            'pass_marks' => 'required|numeric|min:0',
            'start_datetime ' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_datetime ',
            'instructions' => 'nullable|string',
            'status' => 'required|in:draft,active,archived',
            'questions' => 'required|array|min:1',
            'questions.*.question_id' => 'required|exists:questions,id',
            'questions.*.marks' => 'nullable|numeric|min:0',
            'questions.*.negative_marks' => 'nullable|numeric|min:0',
            'questions.*.display_order' => 'nullable|integer|min:1',
            'questions.*.is_mandatory' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create exam
            $exam = Exam::create([
                //This format EX-2025-XXXXXX
                'code' => 'EX-' . date('Y') . '-' . strtoupper(uniqid()),
                'title' => $request->title,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'duration_minutes' => $request->duration_minutes,
                'total_marks' => $request->total_marks,
                'pass_marks' => $request->pass_marks,
                'start_datetime ' => $request->start_datetime ,
                'end_date' => $request->end_date,
                'instructions' => $request->instructions,
                'status' => $request->status,
                'created_by' => Auth::id(),

                // Additional settings
                'shuffle_questions' => $request->shuffle_questions ?? false,
                'shuffle_options' => $request->shuffle_options ?? false,
                'show_results_immediately' => $request->show_results_immediately ?? true,
                'allow_review' => $request->allow_review ?? true,
                'enable_negative_marking' => $request->enable_negative_marking ?? false,
                'max_attempts' => $request->max_attempts ?? 1,
                'enable_tab_switch_detection' => $request->enable_tab_switch_detection ?? false,
                'disable_copy_paste' => $request->disable_copy_paste ?? false,
                'lock_fullscreen' => $request->lock_fullscreen ?? false,
                'require_webcam' => $request->require_webcam ?? false,
            ]);

            // Attach questions
            foreach ($request->questions as $index => $questionData) {
                $question = Question::findOrFail($questionData['question_id']);

                ExamQuestion::create([
                    'exam_id' => $exam->id,
                    'question_id' => $question->id,
                    'marks' => $questionData['marks'] ?? $question->marks,
                    'negative_marks' => $questionData['negative_marks'] ?? $question->negative_marks ?? 0,
                    'display_order' => $questionData['display_order'] ?? ($index + 1),
                    'is_mandatory' => $questionData['is_mandatory'] ?? true,
                ]);
            }

            DB::commit();

            // Reload exam with relationships
            $exam->load(['subject', 'creator', 'examQuestions.question']);

            return response()->json([
                'success' => true,
                'message' => 'Exam created successfully',
                'data' => $exam,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update exam
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $exam = Exam::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'sometimes|required|exists:subjects,id',
            'duration_minutes' => 'sometimes|required|integer|min:1',
            'total_marks' => 'sometimes|required|numeric|min:0',
            'pass_marks' => 'sometimes|required|numeric|min:0',
            'start_datetime ' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_datetime ',
            'instructions' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,active,archived',
            'questions' => 'sometimes|array',
            'questions.*.question_id' => 'required|exists:questions,id',
            'questions.*.marks' => 'nullable|numeric|min:0',
            'questions.*.negative_marks' => 'nullable|numeric|min:0',
            'questions.*.display_order' => 'nullable|integer|min:1',
            'questions.*.is_mandatory' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update exam details
            $exam->update([
                'title' => $request->title ?? $exam->title,
                'description' => $request->description ?? $exam->description,
                'subject_id' => $request->subject_id ?? $exam->subject_id,
                'duration_minutes' => $request->duration_minutes ?? $exam->duration_minutes,
                'total_marks' => $request->total_marks ?? $exam->total_marks,
                'pass_marks' => $request->pass_marks ?? $exam->pass_marks,
                'start_datetime ' => $request->start_datetime  ?? $exam->start_datetime ,
                'end_date' => $request->end_date ?? $exam->end_date,
                'instructions' => $request->instructions ?? $exam->instructions,
                'status' => $request->status ?? $exam->status,

                // Additional settings
                'shuffle_questions' => $request->shuffle_questions ?? $exam->shuffle_questions,
                'shuffle_options' => $request->shuffle_options ?? $exam->shuffle_options,
                'show_results_immediately' => $request->show_results_immediately ?? $exam->show_results_immediately,
                'allow_review' => $request->allow_review ?? $exam->allow_review,
                'enable_negative_marking' => $request->enable_negative_marking ?? $exam->enable_negative_marking,
                'max_attempts' => $request->max_attempts ?? $exam->max_attempts,
                'enable_tab_switch_detection' => $request->enable_tab_switch_detection ?? $exam->enable_tab_switch_detection,
                'disable_copy_paste' => $request->disable_copy_paste ?? $exam->disable_copy_paste,
                'lock_fullscreen' => $request->lock_fullscreen ?? $exam->lock_fullscreen,
                'require_webcam' => $request->require_webcam ?? $exam->require_webcam,
            ]);

            // Update questions if provided
            if ($request->has('questions')) {
                // Delete existing question associations
                ExamQuestion::where('exam_id', $exam->id)->delete();

                // Add new questions
                foreach ($request->questions as $index => $questionData) {
                    $question = Question::findOrFail($questionData['question_id']);

                    ExamQuestion::create([
                        'exam_id' => $exam->id,
                        'question_id' => $question->id,
                        'marks' => $questionData['marks'] ?? $question->marks,
                        'negative_marks' => $questionData['negative_marks'] ?? $question->negative_marks ?? 0,
                        'display_order' => $questionData['display_order'] ?? ($index + 1),
                        'is_mandatory' => $questionData['is_mandatory'] ?? true,
                    ]);
                }
            }

            DB::commit();

            // Reload exam with relationships
            $exam->load(['subject', 'creator', 'examQuestions.question']);

            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully',
                'data' => $exam,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to update exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete exam
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $exam = Exam::findOrFail($id);

            // Check if exam has any attempts
            if ($exam->attempts()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete exam with existing attempts. Archive it instead.',
                ], 400);
            }

            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
