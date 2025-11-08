<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Services\QuestionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
    public function store(StoreQuestionRequest $request): JsonResponse
    {
        try {
            $question = $this->questionService->createQuestion($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Question created successfully',
                'data' => new QuestionResource($question),
            ], 201);
        } catch (\Exception $e) {
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