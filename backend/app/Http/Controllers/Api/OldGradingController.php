<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class GradingController extends Controller
{
    protected $gradingService;

    public function __construct(GradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    /**
     * Get pending answers for grading
     */
    public function getPendingGrading(Request $request): JsonResponse
    {
        try {
            $examId = $request->input('exam_id');
            $answers = $this->gradingService->getPendingGrading($examId);

            return response()->json([
                'success' => true,
                'data' => $answers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending grading',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Grade a single answer
     */
    public function gradeAnswer(Request $request, int $answerId): JsonResponse
    {
        $request->validate([
            'marks_awarded' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
            'rubric_id' => 'nullable|exists:grading_rubrics,id',
            'criteria_scores' => 'nullable|array',
            'grade_status' => 'in:draft,final',
        ]);

        try {
            $data = array_merge($request->all(), [
                'graded_by' => Auth::id(),
            ]);

            $grade = $this->gradingService->gradeAnswer($answerId, $data);

            return response()->json([
                'success' => true,
                'message' => 'Answer graded successfully',
                'data' => $grade,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to grade answer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk grade multiple answers
     */
    public function bulkGrade(Request $request): JsonResponse
    {
        $request->validate([
            'answer_ids' => 'required|array',
            'answer_ids.*' => 'exists:exam_answers,id',
            'marks_awarded' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
            'rubric_id' => 'nullable|exists:grading_rubrics,id',
        ]);

        try {
            $data = array_merge($request->except('answer_ids'), [
                'graded_by' => Auth::id(),
            ]);

            $count = $this->gradingService->bulkGrade($request->answer_ids, $data);

            return response()->json([
                'success' => true,
                'message' => "{$count} answers graded successfully",
                'data' => ['graded_count' => $count],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk grade answers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish results
     */
    public function publishResults(Request $request): JsonResponse
    {
        $request->validate([
            'attempt_ids' => 'required|array',
            'attempt_ids.*' => 'exists:exam_attempts,id',
        ]);

        try {
            $count = $this->gradingService->publishResults($request->attempt_ids);

            return response()->json([
                'success' => true,
                'message' => "{$count} results published successfully",
                'data' => ['published_count' => $count],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish results',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get grading statistics
     */
    public function getGradingStatistics(Request $request): JsonResponse
    {
        try {
            $examId = $request->input('exam_id');

            // Get statistics
            $stats = [
                'pending_count' => $this->gradingService->getPendingGrading($examId)->count(),
                'graded_count' => 0, // Implement based on your needs
                'published_count' => 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
