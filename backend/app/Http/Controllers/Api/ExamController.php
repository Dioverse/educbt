<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Http\Resources\ExamResource;
use App\Http\Resources\ExamDetailResource;
use App\Services\ExamService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExamController extends Controller
{
    protected $examService;

    public function __construct(ExamService $examService)
    {
        $this->examService = $examService;
    }

    /**
     * Display a listing of exams
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'status',
            'subject_id',
            'grade_level_id',
            'is_scheduled',
            'date_filter',
            'sort_by',
            'sort_order'
        ]);

        $perPage = $request->input('per_page', 15);

        $exams = $this->examService->getAllExams($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ExamResource::collection($exams->items()),
            'meta' => [
                'current_page' => $exams->currentPage(),
                'from' => $exams->firstItem(),
                'last_page' => $exams->lastPage(),
                'per_page' => $exams->perPage(),
                'to' => $exams->lastItem(),
                'total' => $exams->total(),
            ],
        ]);
    }

    /**
     * Store a newly created exam
     */
    public function store(StoreExamRequest $request): JsonResponse
    {
        try {
            $exam = $this->examService->createExam($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Exam created successfully',
                'data' => new ExamDetailResource($exam),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified exam
     */
    public function show(int $id): JsonResponse
    {
        try {
            $exam = $this->examService->getExamById($id);

            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => new ExamDetailResource($exam),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified exam
     */
    public function update(UpdateExamRequest $request, int $id): JsonResponse
    {
        try {
            $exam = $this->examService->updateExam($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Exam updated successfully',
                'data' => new ExamDetailResource($exam),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified exam
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->examService->deleteExam($id);

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

    /**
     * Duplicate an exam
     */
    public function duplicate(int $id): JsonResponse
    {
        try {
            $exam = $this->examService->duplicateExam($id);

            if (!$exam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Exam duplicated successfully',
                'data' => new ExamDetailResource($exam),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to duplicate exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish an exam
     */
    public function publish(int $id): JsonResponse
    {
        try {
            $exam = $this->examService->publishExam($id);

            return response()->json([
                'success' => true,
                'message' => 'Exam published successfully',
                'data' => new ExamDetailResource($exam),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Activate an exam
     */
    public function activate(int $id): JsonResponse
    {
        try {
            $exam = $this->examService->activateExam($id);

            return response()->json([
                'success' => true,
                'message' => 'Exam activated successfully',
                'data' => new ExamDetailResource($exam),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Archive an exam
     */
    public function archive(int $id): JsonResponse
    {
        try {
            $exam = $this->examService->archiveExam($id);

            return response()->json([
                'success' => true,
                'message' => 'Exam archived successfully',
                'data' => new ExamDetailResource($exam),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add questions to exam
     */
    public function addQuestions(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'integer|exists:questions,id',
            'section_id' => 'nullable|integer|exists:exam_sections,id',
        ]);

        try {
            $exam = $this->examService->addQuestionsToExam(
                $id,
                $request->question_ids,
                $request->section_id
            );

            return response()->json([
                'success' => true,
                'message' => 'Questions added successfully',
                'data' => new ExamDetailResource($exam),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add questions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove question from exam
     */
    public function removeQuestion(int $examId, int $examQuestionId): JsonResponse
    {
        try {
            $this->examService->removeQuestionFromExam($examId, $examQuestionId);

            return response()->json([
                'success' => true,
                'message' => 'Question removed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove question',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reorder questions
     */
    public function reorderQuestions(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'question_order' => 'required|array|min:1',
            'question_order.*' => 'integer|exists:exam_questions,id',
        ]);

        try {
            $this->examService->reorderQuestions($id, $request->question_order);

            return response()->json([
                'success' => true,
                'message' => 'Questions reordered successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder questions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get exam statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->examService->getStatistics();

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

    /**
     * Get upcoming exams
     */
    public function upcoming(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 10);
            $exams = $this->examService->getUpcomingExams($limit);

            return response()->json([
                'success' => true,
                'data' => ExamResource::collection($exams),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve upcoming exams',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get ongoing exams
     */
    public function ongoing(): JsonResponse
    {
        try {
            $exams = $this->examService->getOngoingExams();

            return response()->json([
                'success' => true,
                'data' => ExamResource::collection($exams),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ongoing exams',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}