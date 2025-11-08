<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSection;
use App\Models\ExamQuestion;
use App\Models\ExamEligibility;
use App\Models\ExamSupervisor;
use App\Repositories\ExamRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ExamService
{
    protected $examRepository;

    public function __construct(ExamRepository $examRepository)
    {
        $this->examRepository = $examRepository;
    }

    public function getAllExams(array $filters = [], int $perPage = 15)
    {
        return $this->examRepository->getAllPaginated($filters, $perPage);
    }

    public function getExamById(int $id)
    {
        return $this->examRepository->findById($id);
    }

    public function createExam(array $data)
    {
        DB::beginTransaction();

        try {
            // Add creator
            $data['created_by'] = Auth::id();
            
            // Create exam
            $exam = $this->examRepository->create($data);

            // Create sections if provided
            if (isset($data['sections'])) {
                $this->syncSections($exam, $data['sections']);
            }

            // Add questions if provided
            if (isset($data['questions'])) {
                $this->syncQuestions($exam, $data['questions']);
            }

            // Set eligibility if provided
            if (isset($data['eligibility'])) {
                $this->syncEligibility($exam, $data['eligibility']);
            }

            // Add supervisors if provided
            if (isset($data['supervisors'])) {
                $this->syncSupervisors($exam, $data['supervisors']);
            }

            // Calculate totals
            $this->calculateExamTotals($exam);

            DB::commit();

            return $exam->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateExam(int $id, array $data)
    {
        DB::beginTransaction();

        try {
            $exam = $this->examRepository->findById($id);

            if (!$exam) {
                throw new \Exception('Exam not found');
            }

            // Add updater
            $data['updated_by'] = Auth::id();

            // Update exam
            $this->examRepository->update($id, $data);

            // Update sections if provided
            if (isset($data['sections'])) {
                $this->syncSections($exam, $data['sections']);
            }

            // Update questions if provided
            if (isset($data['questions'])) {
                $this->syncQuestions($exam, $data['questions']);
            }

            // Update eligibility if provided
            if (isset($data['eligibility'])) {
                $this->syncEligibility($exam, $data['eligibility']);
            }

            // Update supervisors if provided
            if (isset($data['supervisors'])) {
                $this->syncSupervisors($exam, $data['supervisors']);
            }

            // Recalculate totals
            $this->calculateExamTotals($exam);

            DB::commit();

            return $exam->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteExam(int $id)
    {
        DB::beginTransaction();

        try {
            $exam = $this->examRepository->findById($id);

            if (!$exam) {
                throw new \Exception('Exam not found');
            }

            // Check if exam has attempts
            if ($exam->attempts()->count() > 0) {
                throw new \Exception('Cannot delete exam with existing attempts');
            }

            $this->examRepository->delete($id);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function duplicateExam(int $id)
    {
        return $this->examRepository->duplicate($id);
    }

    public function publishExam(int $id)
    {
        $exam = $this->examRepository->findById($id);

        if (!$exam) {
            throw new \Exception('Exam not found');
        }

        // Validate exam is ready to publish
        if ($exam->examQuestions()->count() === 0) {
            throw new \Exception('Exam must have at least one question');
        }

        $this->examRepository->update($id, ['status' => 'published']);

        return $exam->fresh();
    }

    public function activateExam(int $id)
    {
        $exam = $this->examRepository->findById($id);

        if (!$exam) {
            throw new \Exception('Exam not found');
        }

        if ($exam->status !== 'published') {
            throw new \Exception('Only published exams can be activated');
        }

        $this->examRepository->update($id, ['status' => 'active']);

        return $exam->fresh();
    }

    public function archiveExam(int $id)
    {
        $exam = $this->examRepository->findById($id);

        if (!$exam) {
            throw new \Exception('Exam not found');
        }

        $this->examRepository->update($id, ['status' => 'archived']);

        return $exam->fresh();
    }

    public function addQuestionsToExam(int $examId, array $questionIds, ?int $sectionId = null)
    {
        DB::beginTransaction();

        try {
            $exam = $this->examRepository->findById($examId);

            if (!$exam) {
                throw new \Exception('Exam not found');
            }

            $order = $exam->examQuestions()->max('display_order') ?? 0;

            foreach ($questionIds as $questionId) {
                // Check if question already exists
                $exists = ExamQuestion::where('exam_id', $examId)
                    ->where('question_id', $questionId)
                    ->exists();

                if (!$exists) {
                    ExamQuestion::create([
                        'exam_id' => $examId,
                        'exam_section_id' => $sectionId,
                        'question_id' => $questionId,
                        'marks' => null, // Will use question's default marks
                        'display_order' => ++$order,
                    ]);
                }
            }

            // Recalculate totals
            $this->calculateExamTotals($exam);

            DB::commit();

            return $exam->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function removeQuestionFromExam(int $examId, int $examQuestionId)
    {
        DB::beginTransaction();

        try {
            $examQuestion = ExamQuestion::where('exam_id', $examId)
                ->where('id', $examQuestionId)
                ->first();

            if (!$examQuestion) {
                throw new \Exception('Question not found in exam');
            }

            $examQuestion->delete();

            // Recalculate totals
            $exam = $this->examRepository->findById($examId);
            $this->calculateExamTotals($exam);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function reorderQuestions(int $examId, array $questionOrder)
    {
        DB::beginTransaction();

        try {
            foreach ($questionOrder as $order => $examQuestionId) {
                ExamQuestion::where('id', $examQuestionId)
                    ->where('exam_id', $examId)
                    ->update(['display_order' => $order]);
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getStatistics()
    {
        return $this->examRepository->getStatistics();
    }

    public function getUpcomingExams(int $limit = 10)
    {
        return $this->examRepository->getUpcomingExams($limit);
    }

    public function getOngoingExams()
    {
        return $this->examRepository->getOngoingExams();
    }

    // Private helper methods
    private function syncSections(Exam $exam, array $sections)
    {
        // Delete removed sections
        $sectionIds = array_filter(array_column($sections, 'id'));
        $exam->sections()->whereNotIn('id', $sectionIds)->delete();

        foreach ($sections as $index => $sectionData) {
            if (isset($sectionData['id'])) {
                // Update existing
                ExamSection::where('id', $sectionData['id'])
                    ->update([
                        'title' => $sectionData['title'],
                        'description' => $sectionData['description'] ?? null,
                        'instructions' => $sectionData['instructions'] ?? null,
                        'duration_minutes' => $sectionData['duration_minutes'] ?? null,
                        'display_order' => $index,
                        'is_optional' => $sectionData['is_optional'] ?? false,
                    ]);
            } else {
                // Create new
                ExamSection::create([
                    'exam_id' => $exam->id,
                    'title' => $sectionData['title'],
                    'description' => $sectionData['description'] ?? null,
                    'instructions' => $sectionData['instructions'] ?? null,
                    'duration_minutes' => $sectionData['duration_minutes'] ?? null,
                    'display_order' => $index,
                    'is_optional' => $sectionData['is_optional'] ?? false,
                ]);
            }
        }
    }

    private function syncQuestions(Exam $exam, array $questions)
    {
        // This will be called from the add/remove methods above
    }

    private function syncEligibility(Exam $exam, array $eligibility)
    {
        // Delete existing
        $exam->eligibility()->delete();

        foreach ($eligibility as $rule) {
            ExamEligibility::create([
                'exam_id' => $exam->id,
                'eligibility_type' => $rule['eligibility_type'],
                'user_id' => $rule['user_id'] ?? null,
                'class_id' => $rule['class_id'] ?? null,
                'grade_level_id' => $rule['grade_level_id'] ?? null,
                'is_exempted' => $rule['is_exempted'] ?? false,
            ]);
        }
    }

    private function syncSupervisors(Exam $exam, array $supervisors)
    {
        // Delete removed supervisors
        $userIds = array_column($supervisors, 'user_id');
        $exam->supervisors()->whereNotIn('user_id', $userIds)->delete();

        foreach ($supervisors as $supervisor) {
            ExamSupervisor::updateOrCreate(
                [
                    'exam_id' => $exam->id,
                    'user_id' => $supervisor['user_id'],
                ],
                [
                    'role' => $supervisor['role'] ?? 'supervisor',
                    'can_view_live_sessions' => $supervisor['can_view_live_sessions'] ?? true,
                    'can_flag_candidates' => $supervisor['can_flag_candidates'] ?? true,
                    'can_terminate_sessions' => $supervisor['can_terminate_sessions'] ?? false,
                    'can_message_candidates' => $supervisor['can_message_candidates'] ?? true,
                ]
            );
        }
    }

    private function calculateExamTotals(Exam $exam)
    {
        $totalQuestions = $exam->calculateTotalQuestions();
        $totalMarks = $exam->calculateTotalMarks();

        $exam->update([
            'total_questions' => $totalQuestions,
            'total_marks' => $totalMarks,
        ]);

        // Update section totals
        foreach ($exam->sections as $section) {
            $section->update([
                'total_questions' => $section->calculateTotalQuestions(),
                'total_marks' => $section->calculateTotalMarks(),
            ]);
        }
    }
}