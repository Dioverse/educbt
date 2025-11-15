<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\ExamResult;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExamAttemptController extends Controller
{
    /**
     * Get available exams for students
     */
    public function getAvailableExams(): JsonResponse
    {
        $now = Carbon::now();

        $exams = Exam::with(['subject'])
            ->where('status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNull('start_datetime')
                    ->orWhere('start_datetime', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_datetime')
                    ->orWhere('end_datetime', '>=', $now);
            })
            ->get();

        $userId = Auth::id();

        $examsData = $exams->map(function ($exam) use ($userId, $now) {
            $attempts = ExamAttempt::where('exam_id', $exam->id)
                ->where('user_id', $userId)
                ->count();

            $lastAttempt = ExamAttempt::where('exam_id', $exam->id)
                ->where('user_id', $userId)
                ->latest()
                ->first();

            $isOngoing = true;
            if ($exam->start_datetime && Carbon::parse($exam->start_datetime)->isFuture()) {
                $isOngoing = false;
            }
            if ($exam->end_datetime && Carbon::parse($exam->end_datetime)->isPast()) {
                $isOngoing = false;
            }

            $isUpcoming = false;
            if ($exam->start_datetime && Carbon::parse($exam->start_datetime)->isFuture()) {
                $isUpcoming = true;
            }

            return [
                'id' => $exam->id,
                'title' => $exam->title,
                'description' => $exam->description,
                'subject' => $exam->subject,
                'duration_minutes' => $exam->duration_minutes,
                'total_marks' => $exam->total_marks,
                'pass_marks' => $exam->pass_marks,
                'total_questions' => $exam->examQuestions()->count(),
                'start_datetime' => $exam->start_datetime,
                'end_datetime' => $exam->end_datetime,
                'attempts_taken' => $attempts,
                'max_attempts' => $exam->max_attempts,
                'can_attempt' => $attempts < $exam->max_attempts,
                'last_attempt_status' => $lastAttempt?->status,
                'is_ongoing' => $isOngoing,
                'is_upcoming' => $isUpcoming,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $examsData,
        ]);
    }

    /**
     * Get my attempts
     */
    public function getMyAttempts(): JsonResponse
    {
        $userId = Auth::id();

        $attempts = ExamAttempt::with(['exam.subject', 'result'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attempts,
        ]);
    }

    /**
     * Get exam details for student
     * FIXED: Changed int to string|int
     */
    public function getExamForStudent(string|int $examId): JsonResponse
    {
        $exam = Exam::with(['subject'])->findOrFail($examId);

        if ($exam->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This exam is not currently active',
            ], 400);
        }

        $now = Carbon::now();

        if ($exam->start_datetime && Carbon::parse($exam->start_datetime)->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'This exam has not started yet',
            ], 400);
        }

        if ($exam->end_datetime && Carbon::parse($exam->end_datetime)->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'This exam has ended',
            ], 400);
        }

        $userId = Auth::id();

        $attempts = ExamAttempt::where('exam_id', $examId)
            ->where('user_id', $userId)
            ->count();

        $lastAttempt = ExamAttempt::where('exam_id', $examId)
            ->where('user_id', $userId)
            ->latest()
            ->first();

        if ($attempts >= $exam->max_attempts) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached the maximum number of attempts for this exam',
            ], 400);
        }

        $examData = [
            'id' => $exam->id,
            'title' => $exam->title,
            'description' => $exam->description,
            'subject' => $exam->subject,
            'duration_minutes' => $exam->duration_minutes,
            'total_marks' => $exam->total_marks,
            'pass_marks' => $exam->pass_marks,
            'instructions' => $exam->instructions,
            'total_questions' => $exam->examQuestions()->count(),
            'attempts_taken' => $attempts,
            'max_attempts' => $exam->max_attempts,
            'can_attempt' => $attempts < $exam->max_attempts,
            'last_attempt_status' => $lastAttempt?->status,
            'start_datetime' => $exam->start_datetime,
            'end_datetime' => $exam->end_datetime,
            'require_webcam' => $exam->require_webcam,
            'disable_copy_paste' => $exam->disable_copy_paste,
            'enable_tab_switch_detection' => $exam->enable_tab_switch_detection,
            'lock_fullscreen' => $exam->lock_fullscreen,
            'enable_negative_marking' => $exam->enable_negative_marking,
        ];

        return response()->json([
            'success' => true,
            'data' => $examData,
        ]);
    }

    /**
     * Start exam attempt
     * FIXED: Changed int to string|int
     */
    public function startAttempt(Request $request, string|int $examId): JsonResponse
    {
        $exam = Exam::findOrFail($examId);
        $userId = Auth::id();

        if ($exam->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This exam is not currently active',
            ], 400);
        }

        $attemptCount = ExamAttempt::where('exam_id', $examId)
            ->where('user_id', $userId)
            ->count();

        if ($attemptCount >= $exam->max_attempts) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum attempts reached',
            ], 400);
        }

        $inProgressAttempt = ExamAttempt::where('exam_id', $examId)
            ->where('user_id', $userId)
            ->where('status', 'in_progress')
            ->first();

        if ($inProgressAttempt) {
            return response()->json([
                'success' => true,
                'message' => 'Resuming existing attempt',
                'data' => [
                    'exam_attempt_id' => $inProgressAttempt->id,
                ],
            ]);
        }

        DB::beginTransaction();
        try {
            $selfiePath = null;
            if ($request->hasFile('selfie')) {
                $selfiePath = $request->file('selfie')->store('exam-selfies', 'public');
            }

            $attemptCode = $this->generateAttemptCode();

            $attempt = ExamAttempt::create([
                'exam_id' => $examId,
                'user_id' => $userId,
                'attempt_number' => $attemptCount + 1,
                'attempt_code' => $attemptCode,
                'status' => 'in_progress',
                'started_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'selfie_path' => $selfiePath,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Exam started successfully',
                'data' => [
                    'exam_attempt_id' => $attempt->id,
                    'attempt_code' => $attempt->attempt_code,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to start exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attempt with questions
     * FIXED: Changed int to string|int
     */
    public function getAttempt(string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::with(['exam.subject'])->findOrFail($attemptId);

        if ($attempt->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $exam = Exam::with(['examQuestions.question.options'])->findOrFail($attempt->exam_id);

        $answers = ExamAnswer::where('exam_attempt_id', $attemptId)->get();

        $questions = $exam->examQuestions->map(function ($examQuestion) use ($answers) {
            $question = $examQuestion->question;
            $existingAnswer = $answers->firstWhere('question_id', $question->id);

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'marks' => $examQuestion->marks,
                'negative_marks' => $examQuestion->negative_marks,
                'display_order' => $examQuestion->display_order,
                'options' => $question->options,
                'existing_answer' => $existingAnswer ? [
                    'selected_option_id' => $existingAnswer->selected_option_id,
                    'selected_option_ids' => $existingAnswer->selected_option_ids,
                    'answer_text' => $existingAnswer->answer_text,
                    'answer_numeric' => $existingAnswer->answer_numeric,
                    'is_flagged' => $existingAnswer->is_flagged,
                ] : null,
            ];
        })->sortBy('display_order')->values();

        return response()->json([
            'success' => true,
            'data' => [
                'attempt' => $attempt,
                'exam' => [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'subject' => $exam->subject,
                    'duration_minutes' => $exam->duration_minutes,
                    'total_marks' => $exam->total_marks,
                    'pass_marks' => $exam->pass_marks,
                    'enable_negative_marking' => $exam->enable_negative_marking,
                ],
                'questions' => $questions,
            ],
        ]);
    }

    /**
     * Save answer
     * FIXED: Changed int to string|int
     */
    public function saveAnswer(Request $request, string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        if ($attempt->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'This attempt is no longer active',
            ], 400);
        }

        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'selected_option_id' => 'nullable|exists:question_options,id',
            'selected_option_ids' => 'nullable|array',
            'selected_option_ids.*' => 'exists:question_options,id',
            'answer_text' => 'nullable|string',
            'answer_numeric' => 'nullable|numeric',
            'is_flagged' => 'boolean',
        ]);

        $answer = ExamAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attemptId,
                'question_id' => $validated['question_id'],
            ],
            [
                'selected_option_id' => $validated['selected_option_id'] ?? null,
                'selected_option_ids' => $validated['selected_option_ids'] ?? null,
                'answer_text' => $validated['answer_text'] ?? null,
                'answer_numeric' => $validated['answer_numeric'] ?? null,
                'is_flagged' => $validated['is_flagged'] ?? false,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Answer saved',
            'data' => $answer,
        ]);
    }

    /**
     * Submit exam
     * FIXED: Changed int to string|int
     */
    public function submitAttempt(string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::with('exam')->findOrFail($attemptId);

        if ($attempt->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Attempt already submitted',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $attempt->update([
                'status' => 'submitted',
                'ended_at' => now(),
            ]);

            $this->gradeExam($attempt);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Exam submitted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit exam',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get result
     * FIXED: Changed int to string|int
     */
    public function getResult(string|int $attemptId): JsonResponse
    {
        $attempt = ExamAttempt::with(['exam.subject', 'result'])->findOrFail($attemptId);

        if ($attempt->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!$attempt->result) {
            return response()->json([
                'success' => false,
                'message' => 'Result not yet available',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'result' => $attempt->result,
                'exam' => $attempt->exam,
                'attempt' => $attempt,
            ],
        ]);
    }

    /**
     * Generate unique attempt code
     */
    protected function generateAttemptCode(): string
    {
        do {
            $code = 'EXM-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
            $exists = ExamAttempt::where('attempt_code', $code)->exists();
        } while ($exists);

        return $code;
    }

    /**
     * Grade exam
     */
    protected function gradeExam(ExamAttempt $attempt): void
    {
        $exam = $attempt->exam;
        $answers = ExamAnswer::where('exam_attempt_id', $attempt->id)->get();

        $totalMarks = 0;
        $marksObtained = 0;
        $correctAnswers = 0;
        $incorrectAnswers = 0;
        $unanswered = 0;

        foreach ($exam->examQuestions as $examQuestion) {
            $question = $examQuestion->question;
            $totalMarks += $examQuestion->marks;

            $answer = $answers->firstWhere('question_id', $question->id);

            if (!$answer || $this->isAnswerEmpty($answer, $question->type)) {
                $unanswered++;
                continue;
            }

            $isCorrect = $this->checkAnswer($question, $answer);

            if ($isCorrect) {
                $correctAnswers++;
                $marksObtained += $examQuestion->marks;
            } else {
                $incorrectAnswers++;
                if ($exam->enable_negative_marking && $examQuestion->negative_marks > 0) {
                    $marksObtained -= $examQuestion->negative_marks;
                }
            }
        }

        $marksObtained = max(0, $marksObtained);
        $percentage = $totalMarks > 0 ? ($marksObtained / $totalMarks) * 100 : 0;
        $passStatus = $marksObtained >= $exam->pass_marks ? 'pass' : 'fail';
        $grade = $this->calculateGrade($percentage);
        $timeTaken = $attempt->started_at->diffInSeconds($attempt->ended_at);

        ExamResult::create([
            'exam_attempt_id' => $attempt->id,
            'exam_submission_id' => null,
            'exam_id' => $exam->id,
            'user_id' => $attempt->user_id,
            'marks_obtained' => $marksObtained,
            'total_marks' => $totalMarks,
            'percentage' => $percentage,
            'grade' => $grade,
            'pass_status' => $passStatus,
            'correct_answers' => $correctAnswers,
            'incorrect_answers' => $incorrectAnswers,
            'unanswered' => $unanswered,
            'time_taken_seconds' => $timeTaken,
        ]);
    }

    protected function isAnswerEmpty(ExamAnswer $answer, string $questionType): bool
    {
        switch ($questionType) {
            case 'multiple_choice_single':
            case 'true_false':
                return !$answer->selected_option_id;

            case 'multiple_choice_multiple':
                return !$answer->selected_option_ids || empty($answer->selected_option_ids);

            case 'short_answer':
            case 'essay':
                return !$answer->answer_text || trim($answer->answer_text) === '';

            case 'numeric':
                return $answer->answer_numeric === null;

            default:
                return true;
        }
    }

    protected function checkAnswer($question, ExamAnswer $answer): bool
    {
        switch ($question->type) {
            case 'multiple_choice_single':
            case 'true_false':
                $correctOption = $question->options->where('is_correct', true)->first();
                return $correctOption && $answer->selected_option_id == $correctOption->id;

            case 'multiple_choice_multiple':
                $correctIds = $question->options->where('is_correct', true)->pluck('id')->toArray();
                $selectedIds = $answer->selected_option_ids ?? [];
                sort($correctIds);
                sort($selectedIds);
                return $correctIds === $selectedIds;

            case 'short_answer':
                $correctAnswer = trim(strtolower($question->correct_answer_text));
                $studentAnswer = trim(strtolower($answer->answer_text));
                if (!$question->case_sensitive) {
                    return $correctAnswer === $studentAnswer;
                }
                return trim($question->correct_answer_text) === trim($answer->answer_text);

            case 'numeric':
                $correctAnswer = (float) $question->correct_answer_numeric;
                $studentAnswer = (float) $answer->answer_numeric;
                $tolerance = (float) ($question->tolerance ?? 0);
                return abs($correctAnswer - $studentAnswer) <= $tolerance;

            case 'essay':
                return false;

            default:
                return false;
        }
    }

    protected function calculateGrade(float $percentage): string
    {
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B';
        if ($percentage >= 60) return 'C';
        if ($percentage >= 50) return 'D';
        return 'F';
    }
}
