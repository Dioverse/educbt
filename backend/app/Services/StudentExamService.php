<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\ExamSubmission;
use App\Models\ExamResult;
use App\Models\ProctoringSession;
use App\Models\ProctoringEvent;
use App\Models\DeviceFingerprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class StudentExamService
{
    public function getAvailableExams(int $userId)
    {
        // Get exams that are active and user is eligible for
        $exams = Exam::query()
            ->where('status', 'active')
            ->where(function ($query) use ($userId) {
                // Public exams
                $query->where('is_public', true)
                    // Or user has eligibility
                    ->orWhereHas('eligibility', function ($q) use ($userId) {
                        $q->where(function ($subQ) use ($userId) {
                            $subQ->where('eligibility_type', 'all')
                                ->orWhere('user_id', $userId);
                        })->where('is_exempted', false);
                    });
            })
            ->with(['subject', 'gradeLevel'])
            ->get()
            ->filter(function ($exam) use ($userId) {
                // Check if user can attempt
                return $exam->canUserAttempt($userId);
            })
            ->values();

        return $exams;
    }

    public function getStudentAttempts(int $userId, ?string $status = null)
    {
        $query = ExamAttempt::where('user_id', $userId)
            ->with(['exam.subject', 'exam.gradeLevel']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function checkEligibility(int $examId, int $userId): array
    {
        $exam = Exam::findOrFail($examId);

        $result = [
            'eligible' => true,
            'can_attempt' => true,
            'reasons' => [],
            'attempts_remaining' => 0,
            'requires_access_code' => false,
        ];

        // Check if exam is active
        if ($exam->status !== 'active') {
            $result['eligible'] = false;
            $result['can_attempt'] = false;
            $result['reasons'][] = 'Exam is not active';
            return $result;
        }

        // Check schedule
        if ($exam->isScheduled()) {
            $now = now();
            if ($exam->start_datetime > $now) {
                $result['eligible'] = false;
                $result['can_attempt'] = false;
                $result['reasons'][] = 'Exam has not started yet';
                return $result;
            }
            if ($exam->end_datetime < $now) {
                $result['eligible'] = false;
                $result['can_attempt'] = false;
                $result['reasons'][] = 'Exam has ended';
                return $result;
            }
        }

        // Check eligibility
        if (!$exam->is_public) {
            $hasEligibility = $exam->eligibility()
                ->where(function ($query) use ($userId) {
                    $query->where('eligibility_type', 'all')
                        ->orWhere('user_id', $userId);
                })
                ->where('is_exempted', false)
                ->exists();

            if (!$hasEligibility) {
                $result['eligible'] = false;
                $result['can_attempt'] = false;
                $result['reasons'][] = 'You are not eligible for this exam';
                return $result;
            }

            $result['requires_access_code'] = !empty($exam->access_code);
        }

        // Check attempts
        $attemptCount = ExamAttempt::where('exam_id', $examId)
            ->where('user_id', $userId)
            ->whereIn('status', ['submitted', 'auto_submitted'])
            ->count();

        $result['attempts_remaining'] = $exam->max_attempts - $attemptCount;

        if ($attemptCount >= $exam->max_attempts) {
            $result['can_attempt'] = false;
            $result['reasons'][] = 'Maximum attempts reached';
        }

        // Check if user has an ongoing attempt
        $ongoingAttempt = ExamAttempt::where('exam_id', $examId)
            ->where('user_id', $userId)
            ->whereIn('status', ['in_progress', 'paused'])
            ->first();

        if ($ongoingAttempt) {
            $result['has_ongoing_attempt'] = true;
            $result['ongoing_attempt_id'] = $ongoingAttempt->id;
            $result['can_resume'] = $exam->allow_resume;
        }

        return $result;
    }

    public function startExamAttempt(
        int $examId,
        int $userId,
        ?string $accessCode,
        string $ipAddress,
        string $userAgent
    ): ExamAttempt {
        DB::beginTransaction();

        try {
            $exam = Exam::findOrFail($examId);

            // Verify access code if required
            if (!$exam->is_public && $exam->access_code) {
                if ($accessCode !== $exam->access_code) {
                    throw new \Exception('Invalid access code');
                }
            }

            // Check eligibility
            $eligibility = $this->checkEligibility($examId, $userId);
            if (!$eligibility['can_attempt']) {
                throw new \Exception(implode(', ', $eligibility['reasons']));
            }

            // Create attempt
            $attemptNumber = ExamAttempt::where('exam_id', $examId)
                ->where('user_id', $userId)
                ->count() + 1;

            $attempt = ExamAttempt::create([
                'attempt_code' => 'ATT-' . strtoupper(Str::random(10)),
                'exam_id' => $examId,
                'user_id' => $userId,
                'attempt_number' => $attemptNumber,
                'started_at' => now(),
                'expires_at' => now()->addMinutes($exam->duration_minutes),
                'time_remaining_seconds' => $exam->duration_minutes * 60,
                'status' => 'in_progress',
                'current_question_index' => 0,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'resume_token' => Str::random(32),
            ]);

            // Create answer records for all questions
            $examQuestions = $exam->examQuestions()->orderBy('display_order')->get();

            foreach ($examQuestions as $examQuestion) {
                ExamAnswer::create([
                    'exam_attempt_id' => $attempt->id,
                    'question_id' => $examQuestion->question_id,
                    'exam_question_id' => $examQuestion->id,
                    'grading_status' => 'pending',
                ]);
            }

            // Randomize questions if enabled
            if ($exam->randomize_questions) {
                $questionIds = $examQuestions->pluck('id')->shuffle()->toArray();
                $attempt->update(['question_order' => $questionIds]);
            }

            // Create proctoring session if enabled
            if ($exam->enable_screen_monitoring || $exam->enable_tab_switch_detection) {
                ProctoringSession::create([
                    'exam_attempt_id' => $attempt->id,
                    'exam_id' => $exam->id,
                    'user_id' => $userId,
                    'session_started_at' => now(),
                    'status' => 'active',
                    'ip_address' => $ipAddress,
                    'browser' => $this->parseBrowser($userAgent),
                    'os' => $this->parseOS($userAgent),
                ]);
            }

            DB::commit();

            return $attempt->fresh(['exam.examQuestions.question.options']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function resumeExamAttempt(int $attemptId, int $userId): ExamAttempt
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->whereIn('status', ['in_progress', 'paused'])
            ->firstOrFail();

        $exam = $attempt->exam;

        if (!$exam->allow_resume) {
            throw new \Exception('Resume is not allowed for this exam');
        }

        // Check if not expired
        if ($attempt->expires_at < now()) {
            $attempt->update(['status' => 'expired']);
            throw new \Exception('Exam attempt has expired');
        }

        $attempt->update(['status' => 'in_progress']);

        return $attempt->fresh(['exam.examQuestions.question.options', 'answers']);
    }

    public function getExamSession(int $attemptId, int $userId): array
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->with([
                'exam.examQuestions.question.options',
                'exam.examQuestions.question.attachments',
                'answers',
            ])
            ->firstOrFail();

        // Calculate time remaining
        $timeElapsed = now()->diffInSeconds($attempt->started_at);
        $totalTime = $attempt->exam->duration_minutes * 60;
        $timeRemaining = max(0, $totalTime - $timeElapsed);

        // Get questions in order
        $questions = $attempt->exam->examQuestions;
        if ($attempt->question_order) {
            $orderMap = array_flip($attempt->question_order);
            $questions = $questions->sortBy(function ($q) use ($orderMap) {
                return $orderMap[$q->id] ?? 999;
            })->values();
        }

        return [
            'attempt' => $attempt,
            'questions' => $questions,
            'answers' => $attempt->answers->keyBy('question_id'),
            'time_remaining_seconds' => $timeRemaining,
            'progress' => [
                'current_index' => $attempt->current_question_index,
                'total_questions' => $questions->count(),
                'answered' => $attempt->questions_answered,
                'marked_for_review' => $attempt->questions_marked_for_review,
            ],
        ];
    }

    public function saveAnswer(int $attemptId, int $userId, array $data): ExamAnswer
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->where('status', 'in_progress')
            ->firstOrFail();

        $answer = ExamAnswer::where('exam_attempt_id', $attemptId)
            ->where('question_id', $data['question_id'])
            ->firstOrFail();

        // Parse answer based on question type
        $question = $answer->question;
        $updateData = [
            'is_marked_for_review' => $data['is_marked_for_review'] ?? false,
            'time_spent_seconds' => ($answer->time_spent_seconds ?? 0) + ($data['time_spent'] ?? 0),
            'answer_change_count' => $answer->answer_change_count + 1,
            'last_updated_at' => now(),
        ];

        if (!$answer->is_answered) {
            $updateData['first_answered_at'] = now();
            $updateData['is_answered'] = true;
        }

        // Store answer based on question type
        switch ($question->type) {
            case 'multiple_choice_single':
            case 'multiple_choice_multiple':
            case 'true_false':
                $updateData['selected_option_ids'] = is_array($data['answer'])
                    ? $data['answer']
                    : [$data['answer']];
                break;

            case 'short_answer':
                $updateData['text_answer'] = $data['answer'];
                break;

            case 'numeric':
                $updateData['numeric_answer'] = (float) $data['answer'];
                break;

            case 'essay':
                $updateData['text_answer'] = $data['answer'];
                break;

            case 'match_following':
            case 'drag_drop':
                $updateData['match_pairs'] = $data['answer'];
                break;
        }

        $answer->update($updateData);

        // Update attempt progress
        $this->updateAttemptStats($attempt);

        return $answer;
    }

    public function updateProgress(int $attemptId, int $userId, array $data): void
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->where('status', 'in_progress')
            ->firstOrFail();

        $attempt->update([
            'current_question_index' => $data['current_question_index'],
            'time_spent_seconds' => $data['time_spent_seconds'],
            'time_remaining_seconds' => max(0, ($attempt->exam->duration_minutes * 60) - $data['time_spent_seconds']),
        ]);

        // Auto-submit if time expired
        if ($attempt->time_remaining_seconds <= 0) {
            $this->submitExam($attemptId, $userId, 'auto', $attempt->ip_address);
        }
    }

    public function logProctoringEvent(int $attemptId, int $userId, array $data): void
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $session = ProctoringSession::where('exam_attempt_id', $attemptId)->first();

        if (!$session) {
            return;
        }

        ProctoringEvent::create([
            'proctoring_session_id' => $session->id,
            'exam_attempt_id' => $attemptId,
            'event_type' => $data['event_type'],
            'description' => $data['description'] ?? null,
            'event_data' => $data['event_data'] ?? null,
            'severity' => $data['severity'],
            'occurred_at' => now(),
        ]);

        // Update attempt counters
        if ($data['event_type'] === 'tab_switch') {
            $attempt->increment('tab_switch_count');

            // Check if exceeded limit
            $exam = $attempt->exam;
            if ($exam->max_tab_switches_allowed > 0
                && $attempt->tab_switch_count >= $exam->max_tab_switches_allowed) {
                $attempt->update([
                    'is_flagged' => true,
                    'flag_reason' => 'Exceeded maximum tab switches',
                ]);
            }
        }
    }

    public function submitExam(
        int $attemptId,
        int $userId,
        string $submissionType,
        string $ipAddress
    ): ExamSubmission {
        DB::beginTransaction();

        try {
            $attempt = ExamAttempt::where('id', $attemptId)
                ->where('user_id', $userId)
                ->whereIn('status', ['in_progress', 'paused'])
                ->firstOrFail();

            $exam = $attempt->exam;

            // Update attempt status
            $attempt->update([
                'status' => $submissionType === 'auto' ? 'auto_submitted' : 'submitted',
                'submitted_at' => now(),
            ]);

            // Create submission record
            $submission = ExamSubmission::create([
                'exam_attempt_id' => $attempt->id,
                'exam_id' => $exam->id,
                'user_id' => $userId,
                'submitted_at' => now(),
                'submission_type' => $submissionType,
                'ip_address' => $ipAddress,
                'total_questions' => $exam->total_questions,
                'questions_attempted' => $attempt->answers()->where('is_answered', true)->count(),
                'questions_unanswered' => $exam->total_questions - $attempt->answers()->where('is_answered', true)->count(),
                'time_taken_seconds' => $attempt->time_spent_seconds,
                'submission_hash' => $this->generateSubmissionHash($attempt),
            ]);

            // End proctoring session
            $session = ProctoringSession::where('exam_attempt_id', $attemptId)->first();
            if ($session) {
                $session->update([
                    'session_ended_at' => now(),
                    'status' => 'completed',
                ]);
            }

            // Auto-grade if possible
            $this->autoGradeExam($attempt);

            DB::commit();

            return $submission;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getResult(int $attemptId, int $userId)
    {
        $attempt = ExamAttempt::where('id', $attemptId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $result = ExamResult::where('exam_attempt_id', $attemptId)->first();

        if (!$result) {
            throw new \Exception('Results not yet available');
        }

        if (!$result->is_published) {
            throw new \Exception('Results not yet published');
        }

        return $result->load(['exam', 'examAttempt.answers.question']);
    }

    // Private helper methods
    private function updateAttemptStats(ExamAttempt $attempt): void
    {
        $answered = $attempt->answers()->where('is_answered', true)->count();
        $markedForReview = $attempt->answers()->where('is_marked_for_review', true)->count();

        $attempt->update([
            'questions_answered' => $answered,
            'questions_marked_for_review' => $markedForReview,
        ]);
    }

    private function autoGradeExam(ExamAttempt $attempt): void
    {
        // Auto-grade objective questions
        foreach ($attempt->answers as $answer) {
            $question = $answer->question;

            if (in_array($question->type, ['multiple_choice_single', 'multiple_choice_multiple', 'true_false'])) {
                $correctOptions = $question->options()->where('is_correct', true)->pluck('id')->toArray();
                $selectedOptions = $answer->selected_option_ids ?? [];

                $isCorrect = empty(array_diff($correctOptions, $selectedOptions))
                    && empty(array_diff($selectedOptions, $correctOptions));

                $answer->update([
                    'is_correct' => $isCorrect,
                    'marks_obtained' => $isCorrect ? $answer->examQuestion->marks : 0,
                    'grading_status' => 'auto_graded',
                    'graded_at' => now(),
                ]);
            } elseif ($question->type === 'numeric') {
                $correctAnswer = $question->correct_answer_numeric;
                $studentAnswer = $answer->numeric_answer;
                $tolerance = $question->tolerance ?? 0;

                $isCorrect = abs($correctAnswer - $studentAnswer) <= $tolerance;

                $answer->update([
                    'is_correct' => $isCorrect,
                    'marks_obtained' => $isCorrect ? $answer->examQuestion->marks : 0,
                    'grading_status' => 'auto_graded',
                    'graded_at' => now(),
                ]);
            }
        }
    }

    private function generateSubmissionHash(ExamAttempt $attempt): string
    {
        $data = [
            'attempt_id' => $attempt->id,
            'user_id' => $attempt->user_id,
            'exam_id' => $attempt->exam_id,
            'submitted_at' => now()->toDateTimeString(),
        ];

        return hash('sha256', json_encode($data));
    }

    private function parseBrowser(string $userAgent): string
    {
        // Simple browser detection
        if (strpos($userAgent, 'Firefox') !== false) return 'Firefox';
        if (strpos($userAgent, 'Chrome') !== false) return 'Chrome';
        if (strpos($userAgent, 'Safari') !== false) return 'Safari';
        if (strpos($userAgent, 'Edge') !== false) return 'Edge';
        return 'Unknown';
    }

    private function parseOS(string $userAgent): string
    {
        // Simple OS detection
        if (strpos($userAgent, 'Windows') !== false) return 'Windows';
        if (strpos($userAgent, 'Mac') !== false) return 'macOS';
        if (strpos($userAgent, 'Linux') !== false) return 'Linux';
        if (strpos($userAgent, 'Android') !== false) return 'Android';
        if (strpos($userAgent, 'iOS') !== false) return 'iOS';
        return 'Unknown';
    }
}
