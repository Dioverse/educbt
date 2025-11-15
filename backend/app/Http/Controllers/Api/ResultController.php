<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResultService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ResultController extends Controller
{
    protected $resultService;

    public function __construct(ResultService $resultService)
    {
        $this->resultService = $resultService;
    }

    /**
     * Get all results for an exam
     */
    public function getExamResults(Request $request, int $examId): JsonResponse
    {
        try {
            $results = $this->resultService->getExamResults($examId);

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve results',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detailed result for a specific attempt
     */
    public function getAttemptResult(int $attemptId): JsonResponse
    {
        try {
            $result = $this->resultService->getAttemptResult($attemptId);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve attempt result',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get result statistics for an exam
     */
    public function getResultStatistics(int $examId): JsonResponse
    {
        try {
            $stats = $this->resultService->getResultStatistics($examId);

            return response()->json([
                'success' => true,
                'data' => $stats,
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
     * Export exam results to Excel
     */
    public function exportExamResults(int $examId): BinaryFileResponse
    {
        try {
            $filePath = $this->resultService->exportToExcel($examId);

            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to export results',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get student's own results
     */
    public function getMyResults(): JsonResponse
    {
        try {
            $userId = Auth::user()->id;
            $results = $this->resultService->getStudentResults($userId);

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve your results',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish results
     */
    public function publishResults(Request $request, int $examId): JsonResponse
    {
        $request->validate([
            'attempt_ids' => 'required|array',
            'attempt_ids.*' => 'exists:exam_attempts,id',
        ]);

        try {
            $count = $this->resultService->publishResults($request->attempt_ids);

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
}
