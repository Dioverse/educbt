<?php

namespace App\Services;

use App\Models\ExamAnswer;
use App\Models\ExamAttempt;
use App\Models\ExamResult;
use App\Models\AnswerGrade;
use App\Models\GradingRubric;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GradingService
{
    public function getPendingGrading(int $examId = null)
    {
        $query = ExamAnswer::with([
            'examAttempt.user',
            'examAttempt.exam',
            'question',
            'examQuestion', // Load exam question for marks
        ])
            ->where('grading_status', 'pending')
            ->whereHas('question', function ($q) {
                $q->whereIn('type', ['essay', 'short_answer', 'file_upload']);
            });

        if ($examId) {
            $query->whereHas('examAttempt', function ($q) use ($examId) {
                $q->where('exam_id', $examId);
            });
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getAnswerForGrading(int $answerId)
    {
        return ExamAnswer::with([
            'examAttempt.user',
            'examAttempt.exam',
            'question',
            'examQuestion',
            'grade.rubric',
            'grade.grader',
        ])->findOrFail($answerId);
    }

    public function gradeAnswer(int $answerId, array $data): AnswerGrade
    {
        DB::beginTransaction();

        try {
            $answer = ExamAnswer::findOrFail($answerId);

            // Validate marks don't exceed maximum
            $maxMarks = $answer->examQuestion->marks ?? 0;
            if ($data['marks_awarded'] > $maxMarks) {
                throw new \Exception("Marks awarded ({$data['marks_awarded']}) cannot exceed maximum marks ({$maxMarks})");
            }

            // Create or update grade
            $grade = AnswerGrade::updateOrCreate(
                ['exam_answer_id' => $answerId],
                [
                    'rubric_id' => $data['rubric_id'] ?? null,
                    'graded_by' => $data['graded_by'],
                    'marks_awarded' => $data['marks_awarded'],
                    'feedback' => $data['feedback'] ?? null,
                    'criteria_scores' => $data['criteria_scores'] ?? null,
                    'grade_status' => $data['grade_status'] ?? 'final',
                    'graded_at' => now(),
                ]
            );

            // Update answer
            $answer->update([
                'marks_obtained' => $data['marks_awarded'],
                'grading_status' => 'manual_graded',
                'graded_by' => $data['graded_by'],
                'graded_at' => now(),
                'grader_feedback' => $data['feedback'] ?? null,
            ]);

            // Recalculate result if all answers are graded
            $this->recalculateResult($answer->exam_attempt_id);

            DB::commit();

            return $grade->fresh(['rubric', 'grader']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function bulkGrade(array $answerIds, array $data): int
    {
        $count = 0;

        foreach ($answerIds as $answerId) {
            try {
                $this->gradeAnswer($answerId, $data);
                $count++;
            } catch (\Exception $e) {
                // Log error but continue
                Log::error("Failed to grade answer {$answerId}: " . $e->getMessage());
            }
        }

        return $count;
    }

    public function recalculateResult(int $attemptId): void
    {
        $attempt = ExamAttempt::findOrFail($attemptId);

        // Check if all answers are graded
        $pendingCount = $attempt->answers()
            ->where('grading_status', 'pending')
            ->count();

        if ($pendingCount > 0) {
            return; // Still have pending answers
        }

        // Calculate total marks
        $totalMarks = $attempt->exam->total_marks;
        $marksObtained = $attempt->answers()->sum('marks_obtained');

        // Calculate correct/incorrect/unanswered
        $correctAnswers = $attempt->answers()->where('is_correct', true)->count();
        $incorrectAnswers = $attempt->answers()->where('is_correct', false)->where('is_answered', true)->count();
        $unanswered = $attempt->answers()->where('is_answered', false)->count();

        // Calculate percentage
        $percentage = $totalMarks > 0 ? ($marksObtained / $totalMarks) * 100 : 0;

        // Determine pass status
        $passMarks = $attempt->exam->pass_marks ?? 0;
        $passStatus = $marksObtained >= $passMarks ? 'pass' : 'fail';

        // Determine grade
        $grade = $this->calculateGrade($percentage);

        // Update or create result
        ExamResult::updateOrCreate(
            ['exam_attempt_id' => $attemptId],
            [
                'exam_submission_id' => $attempt->submission?->id,
                'exam_id' => $attempt->exam_id,
                'user_id' => $attempt->user_id,
                'total_marks' => $totalMarks,
                'marks_obtained' => $marksObtained,
                'percentage' => $percentage,
                'correct_answers' => $correctAnswers,
                'incorrect_answers' => $incorrectAnswers,
                'unanswered' => $unanswered,
                'grade' => $grade,
                'pass_status' => $passStatus,
                'time_taken_seconds' => $attempt->time_spent_seconds,
                'is_published' => false,
            ]
        );
    }

    public function publishResults(array $attemptIds): int
    {
        return ExamResult::whereIn('exam_attempt_id', $attemptIds)
            ->update([
                'is_published' => true,
                'published_at' => now(),
                'published_by' => auth()->id(),
            ]);
    }

    public function getStatistics(int $examId = null): array
    {
        $query = ExamAnswer::query();

        if ($examId) {
            $query->whereHas('examAttempt', function ($q) use ($examId) {
                $q->where('exam_id', $examId);
            });
        }

        $query->whereHas('question', function ($q) {
            $q->whereIn('type', ['essay', 'short_answer', 'file_upload']);
        });

        $pendingCount = (clone $query)->where('grading_status', 'pending')->count();
        $gradedCount = (clone $query)->whereIn('grading_status', ['auto_graded', 'manual_graded'])->count();

        // Get published results count
        $publishedQuery = ExamResult::where('is_published', true);
        if ($examId) {
            $publishedQuery->where('exam_id', $examId);
        }
        $publishedCount = $publishedQuery->count();

        return [
            'pending_count' => $pendingCount,
            'graded_count' => $gradedCount,
            'published_count' => $publishedCount,
        ];
    }

    private function calculateGrade(float $percentage): string
    {
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 40) return 'D';
        return 'F';
    }
}
