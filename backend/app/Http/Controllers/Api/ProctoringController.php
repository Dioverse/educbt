<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ProctoringSession;
use App\Services\ProctoringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProctoringController extends Controller
{
    protected ProctoringService $proctoringService;

    public function __construct(ProctoringService $proctoringService)
    {
        $this->proctoringService = $proctoringService;
    }

    /**
     * Log a proctoring event
     */
    public function logEvent(Request $request, string|int $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'event_type' => 'required|string',
            'event_data' => 'nullable|array',
            'severity' => 'nullable|in:info,warning,critical',
        ]);

        $event = $this->proctoringService->logEvent(
            $attemptId,
            $validated['event_type'],
            $validated['event_data'] ?? [],
            $validated['severity'] ?? 'warning'
        );

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to log event',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    /**
     * Capture selfie
     */
    public function captureSelfie(Request $request, string|int $attemptId): JsonResponse
    {
        $validated = $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
            'capture_type' => 'nullable|in:initial,periodic,random,flagged',
            'analysis_data' => 'nullable|array',
        ]);

        try {
            $path = $request->file('image')->store('selfie-captures', 'public');

            $capture = $this->proctoringService->captureSelfie(
                $attemptId,
                $path,
                $validated['capture_type'] ?? 'periodic',
                $validated['analysis_data'] ?? []
            );

            return response()->json([
                'success' => true,
                'data' => $capture,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to capture selfie',
            ], 500);
        }
    }

    /**
     * Heartbeat - keep session alive
     */
    public function heartbeat(string|int $attemptId): JsonResponse
    {
        $this->proctoringService->updateHeartbeat($attemptId);

        return response()->json([
            'success' => true,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Report connection loss
     */
    public function connectionLost(string|int $attemptId): JsonResponse
    {
        $this->proctoringService->handleConnectionLoss($attemptId);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Report connection restored
     */
    public function connectionRestored(string|int $attemptId): JsonResponse
    {
        $this->proctoringService->handleConnectionRestore($attemptId);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Get proctoring session stats
     */
    public function getSessionStats(string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        if ($attempt->user_id !== Auth::id() && !Auth::user()->hasRole(['admin', 'supervisor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $session = ProctoringSession::where('exam_attempt_id', $attemptId)->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Proctoring session not found',
            ], 404);
        }

        $stats = $this->proctoringService->getSessionStats($session->id);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
