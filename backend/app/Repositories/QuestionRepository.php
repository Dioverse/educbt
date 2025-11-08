<?php

namespace App\Repositories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionRepository
{
    protected $model;

    public function __construct(Question $model)
    {
        $this->model = $model;
    }

    public function getAllPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['subject', 'topic', 'options', 'attachments', 'creator']);

        // Apply filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['difficulty'])) {
            $query->byDifficulty($filters['difficulty']);
        }

        if (!empty($filters['subject_id'])) {
            $query->bySubject($filters['subject_id']);
        }

        if (!empty($filters['topic_id'])) {
            $query->byTopic($filters['topic_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['is_verified'])) {
            $query->where('is_verified', $filters['is_verified']);
        }

        if (!empty($filters['tags'])) {
            $tags = is_array($filters['tags']) ? $filters['tags'] : [$filters['tags']];
            foreach ($tags as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Question
    {
        return $this->model->with([
            'subject', 
            'topic', 
            'options', 
            'attachments', 
            'creator', 
            'updater'
        ])->find($id);
    }

    public function create(array $data): Question
    {
        // Generate code if not provided
        if (empty($data['code'])) {
            $data['code'] = Question::generateCode();
        }

        return $this->model->create($data);
    }

    public function update(int $id, array $data): bool
    {
        $question = $this->findById($id);
        
        if (!$question) {
            return false;
        }

        return $question->update($data);
    }

    public function delete(int $id): bool
    {
        $question = $this->findById($id);
        
        if (!$question) {
            return false;
        }

        return $question->delete();
    }

    public function restore(int $id): bool
    {
        $question = $this->model->withTrashed()->find($id);
        
        if (!$question) {
            return false;
        }

        return $question->restore();
    }

    public function forceDelete(int $id): bool
    {
        $question = $this->model->withTrashed()->find($id);
        
        if (!$question) {
            return false;
        }

        return $question->forceDelete();
    }

    public function getByIds(array $ids): Collection
    {
        return $this->model->with(['options', 'attachments'])
            ->whereIn('id', $ids)
            ->get();
    }

    public function getStatistics(): array
    {
        return [
            'total' => $this->model->count(),
            'active' => $this->model->active()->count(),
            'verified' => $this->model->verified()->count(),
            'by_type' => $this->model->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'by_difficulty' => $this->model->selectRaw('difficulty_level, COUNT(*) as count')
                ->groupBy('difficulty_level')
                ->pluck('count', 'difficulty_level')
                ->toArray(),
        ];
    }

    public function duplicateQuestion(int $id): ?Question
    {
        $original = $this->findById($id);
        
        if (!$original) {
            return null;
        }

        $duplicate = $original->replicate();
        $duplicate->code = Question::generateCode();
        $duplicate->is_verified = false;
        $duplicate->verified_at = null;
        $duplicate->verified_by = null;
        $duplicate->save();

        // Duplicate options
        foreach ($original->options as $option) {
            $newOption = $option->replicate();
            $newOption->question_id = $duplicate->id;
            $newOption->save();
        }

        // Duplicate attachments
        foreach ($original->attachments as $attachment) {
            $newAttachment = $attachment->replicate();
            $newAttachment->question_id = $duplicate->id;
            $newAttachment->save();
        }

        return $duplicate->fresh(['options', 'attachments']);
    }
}