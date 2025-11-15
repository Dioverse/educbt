<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ProctoringEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LiveProctoringController extends Controller
{
    /**
     * Get live exam sessions (Admin/Teacher)
     */
    public function getLiveSessions(): JsonResponse
    {
        $sessions = ExamAttempt::with(['user', 'exam'])
            ->where('status', 'in_progress')
            ->withCount('proctoringEvents')
            ->get()
            ->map(function ($attempt) {
                $events = $attempt->proctoringEvents()
                    ->orderBy('occurred_at', 'desc')
                    ->limit(10)
                    ->get();

                $criticalEvents = $attempt->proctoringEvents()
                    ->where('severity', 'critical')
                    ->count();

                $highEvents = $attempt->proctoringEvents()
                    ->where('severity', 'high')
                    ->count();

                return [
                    'attempt_id' => $attempt->id,
                    'attempt_code' => $attempt->attempt_code,
                    'student_name' => $attempt->user->name,
                    'student_email' => $attempt->user->email,
                    'exam_title' => $attempt->exam->title,
                    'started_at' => $attempt->started_at,
                    'duration_minutes' => $attempt->exam->duration_minutes,
                    'total_events' => $attempt->proctoring_events_count,
                    'critical_events' => $criticalEvents,
                    'high_severity_events' => $highEvents,
                    'recent_events' => $events,
                    'selfie_path' => $attempt->selfie_path,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    /**
     * Get detailed session info
     */
    public function getSessionDetails(int $attemptId): JsonResponse
    {
        // try {
            $attempt = ExamAttempt::with(['user', 'exam', 'proctoringEvents' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(50);
            }])->findOrFail($attemptId);

            return response()->json([
                'success' => true,
                'data' => [
                    'attempt_id' => $attempt->id,
                    'user' => $attempt->user,
                    'exam' => $attempt->exam,
                    'status' => $attempt->status,
                    'current_question_index' => $attempt->current_question_index,
                    'time_spent_seconds' => $attempt->time_spent_seconds,
                    'is_online' => $attempt->isSessionActive(),
                    'last_activity_at' => $attempt->last_activity_at,
                    'device_info' => [
                        'ip_address' => $attempt->ip_address,
                        'user_agent' => $attempt->user_agent,
                        'device_type' => $attempt->device_type,
                        'browser' => $attempt->browser,
                        'os' => $attempt->os,
                        'additional' => $attempt->device_info,
                    ],
                    'proctoring' => [
                        'selfie_captured' => !empty($attempt->selfie_image_path),
                        'selfie_url' => $attempt->selfie_image_path,
                        'recent_events' => $attempt->proctoringEvents,
                    ],
                ],
            ]);
        // } catch (\Exception $e) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Failed to retrieve session details',
        //     ], 404);
        // }
    }

    /**
     * Update student heartbeat (called by frontend every 30 seconds)
     */
    public function heartbeat(Request $request, int $attemptId): JsonResponse
    {
        try {
            $attempt = ExamAttempt::findOrFail($attemptId);

            // Verify user owns this attempt
            if ($attempt->user_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $attempt->update([
                'last_activity_at' => now(),
                'is_online' => true,
                'current_question_index' => $request->input('current_question_index', 0),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Heartbeat recorded',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record heartbeat',
            ], 500);
        }
    }

    /**
     * Log proctoring event (Student)
     */
    public function logEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'attempt_id' => 'required|exists:exam_attempts,id',
            'event_type' => 'required|string',
            'event_data' => 'nullable|array',
            'severity' => 'nullable|string|in:low,medium,high,critical',
        ]);

        $attempt = ExamAttempt::findOrFail($validated['attempt_id']);

        // Verify user owns this attempt
        if ($attempt->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Create proctoring event
        $event = ProctoringEvent::create([
            'attempt_id' => $attempt->id,
            'exam_id' => $attempt->exam_id,
            'user_id' => Auth::id(),
            'event_type' => $validated['event_type'],
            'event_data' => $validated['event_data'] ?? null,
            'severity' => $validated['severity'] ?? $this->determineSeverity($validated['event_type']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'detected_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event logged',
        ]);
    }

     /**
     * Get attempt proctoring events (Admin/Teacher)
     */
    public function getAttemptEvents(string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::with(['user', 'exam'])->findOrFail($attemptId);

        $events = ProctoringEvent::where('attempt_id', $attemptId)
            ->orderBy('detected_at', 'desc')
            ->get();

        $eventSummary = [
            'total' => $events->count(),
            'critical' => $events->where('severity', 'critical')->count(),
            'high' => $events->where('severity', 'high')->count(),
            'medium' => $events->where('severity', 'medium')->count(),
            'low' => $events->where('severity', 'low')->count(),
            'by_type' => $events->groupBy('event_type')->map->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'attempt' => $attempt,
                'events' => $events,
                'summary' => $eventSummary,
            ],
        ]);
    }



    /**
     * Flag student by supervisor
     */
    public function flagStudent(Request $request, int $attemptId): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        try {
            $attempt = ExamAttempt::findOrFail($attemptId);

            ProctoringEvent::create([
                'exam_attempt_id' => $attemptId,
                'user_id' => $attempt->user_id,
                'event_type' => 'flagged_by_supervisor',
                'description' => $request->reason,
                'metadata' => [
                    'flagged_by' => $request->user()->name,
                    'supervisor_id' => $request->user()->id,
                ],
                'severity' => 3,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student flagged successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to flag student',
            ], 500);
        }
    }

    /**
     * Terminate attempt (Admin/Teacher)
     */
    public function terminateAttempt(string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        if ($attempt->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Attempt is not in progress',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $attempt->update([
                'status' => 'terminated',
                'ended_at' => now(),
            ]);

            // Log termination event
            ProctoringEvent::create([
                'attempt_id' => $attempt->id,
                'exam_id' => $attempt->exam_id,
                'user_id' => $attempt->user_id,
                'event_type' => 'attempt_terminated',
                'event_data' => [
                    'terminated_by' => Auth::id(),
                    'reason' => 'Admin/Teacher termination',
                ],
                'severity' => 'critical',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'detected_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attempt terminated successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to terminate attempt',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Determine severity based on event type
     */
    protected function determineSeverity(string $eventType): string
    {
        $severityMap = [
            'tab_switch' => 'high',
            'window_blur' => 'high',
            'fullscreen_exit' => 'critical',
            'copy_attempt' => 'high',
            'paste_attempt' => 'high',
            'cut_attempt' => 'high',
            'right_click' => 'medium',
            'context_menu' => 'medium',
            'devtools_open' => 'critical',
            'print_attempt' => 'high',
            'multiple_faces' => 'critical',
            'no_face' => 'high',
            'page_reload' => 'medium',
        ];

        return $severityMap[$eventType] ?? 'low';
    }

}
