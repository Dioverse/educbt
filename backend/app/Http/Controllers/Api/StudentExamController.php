<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\ExamSubmission;
use App\Services\StudentExamService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class StudentExamController extends Controller
{
    protected $studentExamService;

    public function __construct(StudentExamService $studentExamService)
    {
        $this->studentExamService = $studentExamService;
    }

    /**
     * Get available exams for student
     */
    public function availableExams(): JsonResponse
    {
        try {
            $exams = $this->studentExamService->getAvailableExams(Auth::id());

            return response()->json([
                'success' => true,
                'data' => $exams,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available exams',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get student's exam attempts
     */
    public function myAttempts(Request $request): JsonResponse
    {
        try {
            $status = $request->input('status');
            $attempts = $this->studentExamService->getStudentAttempts(Auth::id(), $status);

            return response()->json([
                'success' => true,
                'data' => $attempts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve attempts',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check exam eligibility
     */
    public function checkEligibility(int $examId): JsonResponse
    {
        try {
            $result = $this->studentExamService->checkEligibility($examId, Auth::id());

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check eligibility',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Start exam attempt
     */
    public function startExam(Request $request, int $examId): JsonResponse
    {
        $request->validate([
            'access_code' => 'nullable|string',
        ]);

        try {
            $attempt = $this->studentExamService->startExamAttempt(
                $examId,
                Auth::id(),
                $request->access_code,
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Exam started successfully',
                'data' => $attempt,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Resume exam attempt
     */
    public function resumeExam(int $attemptId): JsonResponse
    {
        try {
            $attempt = $this->studentExamService->resumeExamAttempt($attemptId, Auth::id());

            return response()->json([
                'success' => true,
                'message' => 'Exam resumed successfully',
                'data' => $attempt,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get current exam session
     */
    public function getExamSession(int $attemptId): JsonResponse
    {
        try {
            $session = $this->studentExamService->getExamSession($attemptId, Auth::id());
            if (!$session) {
                throw new \Exception('Exam session not found or access denied.');
            }
            return response()->json([
                'success' => true,
                'data' => $session,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Save answer
     */
    public function saveAnswer(Request $request, int $attemptId): JsonResponse
    {
        $request->validate([
            'question_id' => 'required|exists:questions,id',
            'exam_question_id' => 'required|exists:exam_questions,id',
            'answer' => 'required',
            'time_spent' => 'nullable|integer',
            'is_marked_for_review' => 'boolean',
        ]);

        try {
            $answer = $this->studentExamService->saveAnswer(
                $attemptId,
                Auth::id(),
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Answer saved successfully',
                'data' => $answer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save answer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update exam progress
     */
    public function updateProgress(Request $request, int $attemptId): JsonResponse
    {
        $request->validate([
            'current_question_index' => 'required|integer|min:0',
            'time_spent_seconds' => 'required|integer|min:0',
        ]);

        try {
            $this->studentExamService->updateProgress(
                $attemptId,
                Auth::id(),
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Progress updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update progress',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log proctoring event
     */
    public function logProctoringEvent(Request $request, int $attemptId): JsonResponse
    {
        $request->validate([
            'event_type' => 'required|string',
            'description' => 'nullable|string',
            'severity' => 'required|in:low,medium,high,critical',
            'event_data' => 'nullable|array',
        ]);

        try {
            $this->studentExamService->logProctoringEvent(
                $attemptId,
                Auth::id(),
                $request->all()
            );

            return response()->json([
                'success' => true,
                'message' => 'Event logged successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to log event',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit exam
     */
    public function submitExam(Request $request, int $attemptId): JsonResponse
    {
        $request->validate([
            'submission_type' => 'in:manual,auto,forced',
        ]);

        try {
            $submission = $this->studentExamService->submitExam(
                $attemptId,
                Auth::id(),
                $request->submission_type ?? 'manual',
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'message' => 'Exam submitted successfully',
                'data' => $submission,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get exam result
     */
    public function getResult(int $attemptId): JsonResponse
    {
        try {
            $result = $this->studentExamService->getResult($attemptId, Auth::id());

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
