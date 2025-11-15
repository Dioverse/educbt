<?php

namespace App\Services;

use App\Models\ProctoringSession;
use App\Models\ProctoringEvent;
use App\Models\SelfieCapture;
use App\Models\ExamAttempt;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProctoringService
{
    /**
     * Start a proctoring session
     */
    public function startSession(ExamAttempt $attempt, array $systemInfo): ProctoringSession
    {
        $session = ProctoringSession::create([
            'exam_attempt_id' => $attempt->id,
            'exam_id' => $attempt->exam_id,
            'user_id' => $attempt->user_id,
            'status' => 'active',
            'started_at' => now(),
            'browser' => $systemInfo['browser'] ?? null,
            'browser_version' => $systemInfo['browser_version'] ?? null,
            'os' => $systemInfo['os'] ?? null,
            'screen_info' => $systemInfo['screen_info'] ?? null,
            'connection_status' => 'stable',
            'last_activity_at' => now(),
        ]);

        Log::info('Proctoring session started', [
            'session_id' => $session->id,
            'attempt_id' => $attempt->id,
        ]);

        return $session;
    }

    /**
     * End a proctoring session
     */
    public function endSession(ProctoringSession $session): void
    {
        $session->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);

        // Calculate total recording duration
        if ($session->started_at && $session->ended_at) {
            $duration = $session->started_at->diffInSeconds($session->ended_at);
            $session->update(['recording_duration_seconds' => $duration]);
        }

        Log::info('Proctoring session ended', [
            'session_id' => $session->id,
            'total_violations' => $session->total_violations,
        ]);
    }

    /**
     * Log a proctoring event
     */
    public function logEvent(
        int $attemptId,
        string $eventType,
        array $eventData = [],
        string $severity = 'warning'
    ): ?ProctoringEvent {
        try {
            $attempt = ExamAttempt::find($attemptId);
            if (!$attempt) {
                return null;
            }

            // Find or create proctoring session
            $session = ProctoringSession::where('exam_attempt_id', $attemptId)
                ->where('status', 'active')
                ->first();

            if (!$session) {
                Log::warning('No active proctoring session found for event', [
                    'attempt_id' => $attemptId,
                    'event_type' => $eventType,
                ]);
                return null;
            }

            // Create event
            $event = ProctoringEvent::create([
                'proctoring_session_id' => $session->id,
                'exam_attempt_id' => $attemptId,
                'event_type' => $eventType,
                'severity' => $severity,
                'event_data' => $eventData,
            ]);

            // Update session violation count
            $session->increment('total_violations');
            $session->touch('last_activity_at');

            // Update violation summary
            $this->updateViolationSummary($session, $eventType);

            Log::info('Proctoring event logged', [
                'event_id' => $event->id,
                'event_type' => $eventType,
                'severity' => $severity,
            ]);

            return $event;
        } catch (\Exception $e) {
            Log::error('Failed to log proctoring event', [
                'attempt_id' => $attemptId,
                'event_type' => $eventType,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Capture selfie
     */
    public function captureSelfie(
        int $attemptId,
        string $imagePath,
        string $captureType = 'periodic',
        array $analysisData = []
    ): ?SelfieCapture {
        try {
            $session = ProctoringSession::where('exam_attempt_id', $attemptId)
                ->where('status', 'active')
                ->first();

            if (!$session) {
                return null;
            }

            $capture = SelfieCapture::create([
                'proctoring_session_id' => $session->id,
                'exam_attempt_id' => $attemptId,
                'capture_type' => $captureType,
                'image_path' => $imagePath,
                'face_detected' => $analysisData['face_detected'] ?? null,
                'face_count' => $analysisData['face_count'] ?? null,
                'face_match_score' => $analysisData['face_match_score'] ?? null,
                'analysis_data' => $analysisData,
                'flagged' => $analysisData['flagged'] ?? false,
                'flag_reason' => $analysisData['flag_reason'] ?? null,
            ]);

            return $capture;
        } catch (\Exception $e) {
            Log::error('Failed to capture selfie', [
                'attempt_id' => $attemptId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Update heartbeat (keep-alive)
     */
    public function updateHeartbeat(int $attemptId): void
    {
        $session = ProctoringSession::where('exam_attempt_id', $attemptId)
            ->where('status', 'active')
            ->first();

        if ($session) {
            $session->update([
                'last_activity_at' => now(),
                'connection_status' => 'stable',
            ]);
        }
    }

    /**
     * Handle connection loss
     */
    public function handleConnectionLoss(int $attemptId): void
    {
        $session = ProctoringSession::where('exam_attempt_id', $attemptId)
            ->where('status', 'active')
            ->first();

        if ($session) {
            $disconnectionLog = $session->disconnection_log ?? [];
            $disconnectionLog[] = [
                'timestamp' => now()->toISOString(),
                'duration' => null, // Will be updated on reconnect
            ];

            $session->update([
                'connection_status' => 'disconnected',
                'disconnection_count' => $session->disconnection_count + 1,
                'disconnection_log' => $disconnectionLog,
            ]);

            $this->logEvent($attemptId, 'network_disconnect', [
                'timestamp' => now()->toISOString(),
            ], 'critical');
        }
    }

    /**
     * Handle connection restore
     */
    public function handleConnectionRestore(int $attemptId): void
    {
        $session = ProctoringSession::where('exam_attempt_id', $attemptId)
            ->where('status', 'active')
            ->first();

        if ($session) {
            $session->update([
                'connection_status' => 'stable',
            ]);

            $this->logEvent($attemptId, 'network_reconnect', [
                'timestamp' => now()->toISOString(),
            ], 'info');
        }
    }

    /**
     * Update violation summary
     */
    protected function updateViolationSummary(ProctoringSession $session, string $eventType): void
    {
        $summary = $session->violation_summary ?? [];

        if (!isset($summary[$eventType])) {
            $summary[$eventType] = 0;
        }

        $summary[$eventType]++;

        $session->update(['violation_summary' => $summary]);
    }

    /**
     * Get session statistics
     */
    public function getSessionStats(int $sessionId): array
    {
        $session = ProctoringSession::with('events')->find($sessionId);

        if (!$session) {
            return [];
        }

        $events = $session->events;

        return [
            'total_violations' => $session->total_violations,
            'violation_summary' => $session->violation_summary ?? [],
            'severity_breakdown' => [
                'critical' => $events->where('severity', 'critical')->count(),
                'warning' => $events->where('severity', 'warning')->count(),
                'info' => $events->where('severity', 'info')->count(),
            ],
            'disconnection_count' => $session->disconnection_count,
            'connection_status' => $session->connection_status,
            'recording_duration' => $session->recording_duration_seconds,
        ];
    }
}
