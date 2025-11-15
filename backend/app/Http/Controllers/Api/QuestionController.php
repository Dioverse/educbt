<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Services\QuestionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    protected $questionService;

    public function __construct(QuestionService $questionService)
    {
        $this->questionService = $questionService;
    }

    /**
     * Display a listing of questions
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'type',
            'difficulty',
            'subject_id',
            'topic_id',
            'is_active',
            'is_verified',
            'tags',
            'sort_by',
            'sort_order'
        ]);

        $perPage = $request->input('per_page', 15);

        $questions = $this->questionService->getAllQuestions($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => QuestionResource::collection($questions->items()),
            'meta' => [
                'current_page' => $questions->currentPage(),
                'from' => $questions->firstItem(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'to' => $questions->lastItem(),
                'total' => $questions->total(),
            ],
        ]);
    }

    /**
     * Store a newly created question
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'type' => 'required|in:multiple_choice_single,multiple_choice_multiple,true_false,short_answer,numeric,essay',
            'question_text' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'difficulty_level' => 'required|in:easy,medium,hard,expert',
            'marks' => 'required|numeric|min:0',
            'negative_marks' => 'nullable|numeric|min:0',
            'explanation' => 'nullable|string',
            'tags' => 'nullable|array',
        ];

        // Add type-specific validation
        if (in_array($request->type, ['multiple_choice_single', 'multiple_choice_multiple', 'true_false'])) {
            $rules['options'] = 'required|array|min:2';
            $rules['options.*.option_text'] = 'required|string';  // ✅ CHANGED FROM option_key
            $rules['options.*.is_correct'] = 'required|boolean';
        }

        if ($request->type === 'short_answer') {
            $rules['correct_answer_text'] = 'required|string';
            $rules['case_sensitive'] = 'nullable|boolean';
        }

        if ($request->type === 'numeric') {
            $rules['correct_answer_numeric'] = 'required|numeric';
            $rules['tolerance'] = 'nullable|numeric|min:0';
        }

        if ($request->type === 'essay') {
            $rules['min_words'] = 'nullable|integer|min:0';
            $rules['max_words'] = 'nullable|integer|min:0';
            $rules['allow_file_upload'] = 'nullable|boolean';
            $rules['allowed_file_types'] = 'nullable|array';
            $rules['max_file_size_kb'] = 'nullable|integer|min:0';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create question
            $question = Question::create([
                'type' => $request->type,
                'question_text' => $request->question_text,
                'question_html' => $request->question_html,
                'explanation' => $request->explanation,
                'explanation_html' => $request->explanation_html,
                'subject_id' => $request->subject_id,
                'topic_id' => $request->topic_id,
                'difficulty_level' => $request->difficulty_level,
                'marks' => $request->marks,
                'negative_marks' => $request->negative_marks ?? 0,
                'tags' => $request->tags ?? [],
                'created_by' => Auth::id(),
                'status' => 'active',
            ]);

            // Handle options for MCQ and True/False
            if (in_array($request->type, ['multiple_choice_single', 'multiple_choice_multiple', 'true_false']) && $request->options) {
                foreach ($request->options as $index => $option) {
                    QuestionOption::create([
                        'question_id' => $question->id,
                        'option_key' => $option['option_key'] ?? chr(65 + $index), // Generate A, B, C if not provided
                        'option_text' => $option['option_text'],
                        'is_correct' => $option['is_correct'] ?? false,
                        'display_order' => $option['display_order'] ?? ($index + 1),
                    ]);
                }
            }

            // Handle short answer
            if ($request->type === 'short_answer') {
                $question->update([
                    'correct_answer_text' => $request->correct_answer_text,
                    'case_sensitive' => $request->case_sensitive ?? false,
                ]);
            }

            // Handle numeric
            if ($request->type === 'numeric') {
                $question->update([
                    'correct_answer_numeric' => $request->correct_answer_numeric,
                    'tolerance' => $request->tolerance ?? 0,
                ]);
            }

            // Handle essay
            if ($request->type === 'essay') {
                $question->update([
                    'min_words' => $request->min_words,
                    'max_words' => $request->max_words,
                    'allow_file_upload' => $request->allow_file_upload ?? false,
                    'allowed_file_types' => $request->allowed_file_types ?? [],
                    'max_file_size_kb' => $request->max_file_size_kb ?? 10240,
                ]);
            }

            DB::commit();

            $question->load(['subject', 'topic', 'options', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Question created successfully',
                'data' => $question,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified question
     */
    public function show(int $id): JsonResponse
    {
        try {
            $question = $this->questionService->getQuestionById($id);

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'message' => 'Question not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new QuestionResource($question),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified question
     */
    public function update(UpdateQuestionRequest $request, int $id): JsonResponse
    {
        try {
            $question = $this->questionService->updateQuestion($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Question updated successfully',
                'data' => new QuestionResource($question),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified question
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->questionService->deleteQuestion($id);

            return response()->json([
                'success' => true,
                'message' => 'Question deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Duplicate a question
     */
    public function duplicate(int $id): JsonResponse
    {
        try {
            $question = $this->questionService->duplicateQuestion($id);

            if (!$question) {
                return response()->json([
                    'success' => false,
                    'message' => 'Question not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Question duplicated successfully',
                'data' => new QuestionResource($question),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to duplicate question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify a question
     */
    public function verify(int $id): JsonResponse
    {
        try {
            $question = $this->questionService->verifyQuestion($id, true);

            return response()->json([
                'success' => true,
                'message' => 'Question verified successfully',
                'data' => new QuestionResource($question),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Unverify a question
     */
    public function unverify(int $id): JsonResponse
    {
        try {
            $question = $this->questionService->verifyQuestion($id, false);

            return response()->json([
                'success' => true,
                'message' => 'Question unverified successfully',
                'data' => new QuestionResource($question),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unverify question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive(int $id): JsonResponse
    {
        try {
            $question = $this->questionService->toggleActive($id);

            return response()->json([
                'success' => true,
                'message' => 'Question status updated successfully',
                'data' => new QuestionResource($question),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle question status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete questions
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:questions,id',
        ]);

        try {
            $this->questionService->bulkDelete($request->ids);

            return response()->json([
                'success' => true,
                'message' => 'Questions deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete questions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update tags
     */
    public function bulkUpdateTags(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:questions,id',
            'tags' => 'required|array|min:1',
            'tags.*' => 'string|max:50',
            'action' => 'required|in:add,remove,replace',
        ]);

        try {
            $this->questionService->bulkUpdateTags(
                $request->ids,
                $request->tags,
                $request->action
            );

            return response()->json([
                'success' => true,
                'message' => 'Tags updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update tags',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get question statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->questionService->getStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
