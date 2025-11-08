<?php

namespace App\Repositories;

use App\Models\Exam;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ExamRepository
{
    protected $model;

    public function __construct(Exam $model)
    {
        $this->model = $model;
    }

    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with([
            'subject', 
            'gradeLevel', 
            'creator',
            'sections',
            'examQuestions',
        ])->withCount(['examQuestions', 'attempts']);

        // Apply filters
        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                  ->orWhere('code', 'like', "%{$filters['search']}%")
                  ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (!empty($filters['grade_level_id'])) {
            $query->where('grade_level_id', $filters['grade_level_id']);
        }

        if (isset($filters['is_scheduled'])) {
            $query->where('is_scheduled', $filters['is_scheduled']);
        }

        if (!empty($filters['date_filter'])) {
            switch ($filters['date_filter']) {
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'ongoing':
                    $query->ongoing();
                    break;
                case 'completed':
                    $query->completed();
                    break;
            }
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Exam
    {
        return $this->model->with([
            'subject',
            'gradeLevel',
            'creator',
            'updater',
            'sections.examQuestions.question',
            'examQuestions.question.options',
            'eligibility.user',
            'eligibility.class',
            'eligibility.gradeLevel',
            'supervisors.user',
        ])->find($id);
    }

    public function create(array $data): Exam
    {
        // Generate code if not provided
        if (empty($data['code'])) {
            $data['code'] = Exam::generateCode();
        }

        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $exam = $this->findById($id);
        
        if (!$exam) {
            return false;
        }

        return $exam->update($data);
    }

    public function delete(int $id): bool
    {
        $exam = $this->findById($id);
        
        if (!$exam) {
            return false;
        }

        return $exam->delete();
    }

    public function duplicate(int $id): ?Exam
    {
        $original = $this->findById($id);
        
        if (!$original) {
            return null;
        }

        $duplicate = $original->replicate();
        $duplicate->code = Exam::generateCode();
        $duplicate->title = $original->title . ' (Copy)';
        $duplicate->status = 'draft';
        $duplicate->save();

        // Duplicate sections
        foreach ($original->sections as $section) {
            $newSection = $section->replicate();
            $newSection->exam_id = $duplicate->id;
            $newSection->save();

            // Duplicate exam questions in section
            foreach ($section->examQuestions as $examQuestion) {
                $newExamQuestion = $examQuestion->replicate();
                $newExamQuestion->exam_id = $duplicate->id;
                $newExamQuestion->exam_section_id = $newSection->id;
                $newExamQuestion->save();
            }
        }

        // Duplicate exam questions without section
        foreach ($original->examQuestions()->whereNull('exam_section_id')->get() as $examQuestion) {
            $newExamQuestion = $examQuestion->replicate();
            $newExamQuestion->exam_id = $duplicate->id;
            $newExamQuestion->save();
        }

        return $duplicate->fresh();
    }

    public function getStatistics(): array
    {
        return [
            'total' => $this->model->count(),
            'draft' => $this->model->where('status', 'draft')->count(),
            'published' => $this->model->where('status', 'published')->count(),
            'active' => $this->model->where('status', 'active')->count(),
            'completed' => $this->model->where('status', 'completed')->count(),
            'archived' => $this->model->where('status', 'archived')->count(),
            'upcoming' => $this->model->upcoming()->count(),
            'ongoing' => $this->model->ongoing()->count(),
        ];
    }

    public function getUpcomingExams(int $limit = 10): Collection
    {
        return $this->model->upcoming()
            ->published()
            ->with(['subject', 'gradeLevel'])
            ->orderBy('start_datetime', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getOngoingExams(): Collection
    {
        return $this->model->ongoing()
            ->active()
            ->with(['subject', 'gradeLevel'])
            ->get();
    }
}