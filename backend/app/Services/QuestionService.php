<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\QuestionAttachment;
use App\Repositories\QuestionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class QuestionService
{
    protected $questionRepository;

    public function __construct(QuestionRepository $questionRepository)
    {
        $this->questionRepository = $questionRepository;
    }

    public function getAllQuestions(array $filters = [], int $perPage = 15)
    {
        return $this->questionRepository->getAllPaginated($filters, $perPage);
    }

    public function getQuestionById(int $id)
    {
        return $this->questionRepository->findById($id);
    }

    public function createQuestion(array $data)
    {
        DB::beginTransaction();

        try {
            // Add creator
            $data['created_by'] = Auth::id();
            
            // Create question
            $question = $this->questionRepository->create($data);

            // Handle options for MCQ
            if (isset($data['options']) && in_array($question->type, ['multiple_choice_single', 'multiple_choice_multiple', 'true_false'])) {
                $this->syncOptions($question, $data['options']);
            }

            // Handle attachments
            if (isset($data['attachments'])) {
                $this->syncAttachments($question, $data['attachments']);
            }

            DB::commit();

            return $question->fresh(['options', 'attachments']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateQuestion(int $id, array $data)
    {
        DB::beginTransaction();

        try {
            $question = $this->questionRepository->findById($id);

            if (!$question) {
                throw new \Exception('Question not found');
            }

            // Add updater
            $data['updated_by'] = Auth::id();

            // Update question
            $this->questionRepository->update($id, $data);

            // Update options if provided
            if (isset($data['options'])) {
                $this->syncOptions($question, $data['options']);
            }

            // Update attachments if provided
            if (isset($data['attachments'])) {
                $this->syncAttachments($question, $data['attachments']);
            }

            DB::commit();

            return $question->fresh(['options', 'attachments']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteQuestion(int $id)
    {
        DB::beginTransaction();

        try {
            $question = $this->questionRepository->findById($id);

            if (!$question) {
                throw new \Exception('Question not found');
            }

            // Delete attachments from storage
            foreach ($question->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            $this->questionRepository->delete($id);

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function duplicateQuestion(int $id)
    {
        return $this->questionRepository->duplicateQuestion($id);
    }

    public function verifyQuestion(int $id, bool $isVerified = true)
    {
        $question = $this->questionRepository->findById($id);

        if (!$question) {
            throw new \Exception('Question not found');
        }

        $data = [
            'is_verified' => $isVerified,
            'verified_at' => $isVerified ? now() : null,
            'verified_by' => $isVerified ? Auth::id() : null,
        ];

        $this->questionRepository->update($id, $data);

        return $question->fresh();
    }

    public function toggleActive(int $id)
    {
        $question = $this->questionRepository->findById($id);

        if (!$question) {
            throw new \Exception('Question not found');
        }

        $this->questionRepository->update($id, [
            'is_active' => !$question->is_active
        ]);

        return $question->fresh();
    }

    public function bulkDelete(array $ids)
    {
        DB::beginTransaction();

        try {
            foreach ($ids as $id) {
                $this->deleteQuestion($id);
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function bulkUpdateTags(array $ids, array $tags, string $action = 'add')
    {
        DB::beginTransaction();

        try {
            foreach ($ids as $id) {
                $question = $this->questionRepository->findById($id);

                if (!$question) {
                    continue;
                }

                $currentTags = $question->tags ?? [];

                if ($action === 'add') {
                    $newTags = array_unique(array_merge($currentTags, $tags));
                } elseif ($action === 'remove') {
                    $newTags = array_diff($currentTags, $tags);
                } else {
                    $newTags = $tags;
                }

                $this->questionRepository->update($id, ['tags' => array_values($newTags)]);
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
        return $this->questionRepository->getStatistics();
    }

    // Private helper methods
    private function syncOptions(Question $question, array $options)
    {
        // Delete existing options
        $question->options()->delete();

        // Create new options
        foreach ($options as $index => $optionData) {
            QuestionOption::create([
                'question_id' => $question->id,
                'option_key' => $optionData['option_key'] ?? chr(65 + $index), // A, B, C, D
                'option_text' => $optionData['option_text'],
                'option_html' => $optionData['option_html'] ?? null,
                'option_image' => $optionData['option_image'] ?? null,
                'is_correct' => $optionData['is_correct'] ?? false,
                'display_order' => $index,
            ]);
        }
    }

    private function syncAttachments(Question $question, array $attachments)
    {
        // Delete removed attachments
        $existingIds = $question->attachments->pluck('id')->toArray();
        $newIds = array_filter(array_column($attachments, 'id'));
        $toDelete = array_diff($existingIds, $newIds);

        foreach ($toDelete as $deleteId) {
            $attachment = QuestionAttachment::find($deleteId);
            if ($attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        // Update or create attachments
        foreach ($attachments as $index => $attachmentData) {
            if (isset($attachmentData['id'])) {
                // Update existing
                QuestionAttachment::where('id', $attachmentData['id'])
                    ->update([
                        'display_order' => $index,
                    ]);
            } else {
                // Create new (handled by MediaService in upload endpoint)
            }
        }
    }
}