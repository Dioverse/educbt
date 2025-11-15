<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QuestionImportExportService
{
    protected function ensureDirectoryExists(string $path): void
    {
        $directory = dirname($path);

        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
    }

    /**
     * Import questions from CSV
     */
    public function importFromCSV(string $filePath, int $userId): array
    {
        $file = fopen($filePath, 'r');
        $header = fgetcsv($file);

        $imported = [];
        $failed = [];
        $lineNumber = 1;

        while (($row = fgetcsv($file)) !== false) {
            $lineNumber++;

            try {
                $data = array_combine($header, $row);
                $question = $this->createQuestionFromArray($data, $userId);
                $imported[] = $question;
            } catch (\Exception $e) {
                $failed[] = [
                    'line' => $lineNumber,
                    'data' => $row,
                    'error' => $e->getMessage(),
                ];
            }
        }

        fclose($file);

        return [
            'imported' => $imported,
            'failed' => $failed,
            'total' => $lineNumber - 1,
            'success_count' => count($imported),
            'failed_count' => count($failed),
        ];
    }

    /**
     * Import questions from JSON
     */
    public function importFromJSON(string $filePath, int $userId): array
    {
        $content = file_get_contents($filePath);
        $questions = json_decode($content, true);

        if (!is_array($questions)) {
            throw new \Exception('Invalid JSON format');
        }

        $imported = [];
        $failed = [];

        foreach ($questions as $index => $data) {
            try {
                $question = $this->createQuestionFromArray($data, $userId);
                $imported[] = $question;
            } catch (\Exception $e) {
                $failed[] = [
                    'index' => $index,
                    'data' => $data,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'imported' => $imported,
            'failed' => $failed,
            'total' => count($questions),
            'success_count' => count($imported),
            'failed_count' => count($failed),
        ];
    }

    /**
     * Create question from array data
     */
    protected function createQuestionFromArray(array $data, int $userId): Question
    {
        DB::beginTransaction();

        try {
            // Find or create subject
            $subject = null;
            if (!empty($data['subject'])) {
                $subject = Subject::firstOrCreate(
                    ['name' => $data['subject']],
                    ['code' => strtoupper(substr($data['subject'], 0, 4))]
                );
            }

            // Find or create topic
            $topic = null;
            if (!empty($data['topic']) && $subject) {
                $topic = Topic::firstOrCreate(
                    ['name' => $data['topic'], 'subject_id' => $subject->id]
                );
            }

            // Create question
            $question = Question::create([
                'question_text' => $data['question_text'],
                'type' => $data['type'],
                'subject_id' => $subject?->id,
                'topic_id' => $topic?->id,
                'difficulty_level' => $data['difficulty_level'] ?? 'medium',
                'marks' => $data['marks'] ?? 1,
                'explanation' => $data['explanation'] ?? null,
                'created_by' => $userId,
                'status' => 'draft',
            ]);

            // Handle options for MCQ/True-False
            if (in_array($data['type'], ['multiple_choice_single', 'multiple_choice_multiple', 'true_false'])) {
                $this->createOptions($question, $data);
            }

            // Handle short answer
            if ($data['type'] === 'short_answer' && !empty($data['acceptable_answers'])) {
                $question->update([
                    'acceptable_answers' => is_array($data['acceptable_answers'])
                        ? $data['acceptable_answers']
                        : explode('|', $data['acceptable_answers']),
                    'is_case_sensitive' => $data['is_case_sensitive'] ?? false,
                ]);
            }

            // Handle numeric
            if ($data['type'] === 'numeric') {
                $question->update([
                    'correct_answer_numeric' => $data['correct_answer_numeric'],
                    'tolerance' => $data['tolerance'] ?? 0,
                    'unit' => $data['unit'] ?? null,
                ]);
            }

            // Handle essay
            if ($data['type'] === 'essay') {
                $question->update([
                    'min_words' => $data['min_words'] ?? null,
                    'max_words' => $data['max_words'] ?? null,
                ]);
            }

            DB::commit();
            return $question;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Create options for question
     */
    protected function createOptions(Question $question, array $data): void
    {
        // Options format: "Option 1|Option 2|Option 3|Option 4"
        // Correct answers format: "1,3" (1-indexed)

        $options = explode('|', $data['options']);
        $correctAnswers = explode(',', $data['correct_answers']);

        foreach ($options as $index => $optionText) {
            QuestionOption::create([
                'question_id' => $question->id,
                'option_text' => trim($optionText),
                'is_correct' => in_array((string)($index + 1), $correctAnswers),
                'display_order' => $index + 1,
            ]);
        }
    }

    /**
     * Export questions to CSV
     */
    public function exportToCSV(array $questionIds = []): string
    {
        $query = Question::with(['options', 'subject', 'topic']);

        if (!empty($questionIds)) {
            $query->whereIn('id', $questionIds);
        }

        $questions = $query->get();

        $filename = storage_path('app/exports/questions_' . time() . '.csv');
        $this->ensureDirectoryExists($filename);
        $file = fopen($filename, 'w');

        // Header
        fputcsv($file, [
            'id',
            'question_text',
            'type',
            'subject',
            'topic',
            'difficulty_level',
            'marks',
            'options',
            'correct_answers',
            'acceptable_answers',
            'correct_answer_numeric',
            'tolerance',
            'unit',
            'min_words',
            'max_words',
            'explanation',
        ]);

        // Data
        foreach ($questions as $question) {
            $row = [
                $question->id,
                $question->question_text,
                $question->type,
                $question->subject?->name ?? '',
                $question->topic?->name ?? '',
                $question->difficulty_level,
                $question->marks,
            ];

            // Options
            if ($question->options->isNotEmpty()) {
                $optionsText = $question->options->pluck('option_text')->implode('|');
                $correctIndexes = $question->options
                    ->filter(fn($opt) => $opt->is_correct)
                    ->pluck('display_order')
                    ->implode(',');
                $row[] = $optionsText;
                $row[] = $correctIndexes;
            } else {
                $row[] = '';
                $row[] = '';
            }

            // Short answer
            $row[] = is_array($question->acceptable_answers)
                ? implode('|', $question->acceptable_answers)
                : '';

            // Numeric
            $row[] = $question->correct_answer_numeric ?? '';
            $row[] = $question->tolerance ?? '';
            $row[] = $question->unit ?? '';

            // Essay
            $row[] = $question->min_words ?? '';
            $row[] = $question->max_words ?? '';

            // Explanation
            $row[] = $question->explanation ?? '';

            fputcsv($file, $row);
        }

        fclose($file);

        return $filename;
    }

    /**
     * Export questions to JSON
     */
    public function exportToJSON(array $questionIds = []): string
    {
        $query = Question::with(['options', 'subject', 'topic']);

        if (!empty($questionIds)) {
            $query->whereIn('id', $questionIds);
        }

        $questions = $query->get()->map(function ($question) {
            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'subject' => $question->subject?->name,
                'topic' => $question->topic?->name,
                'difficulty_level' => $question->difficulty_level,
                'marks' => $question->marks,
                'options' => $question->options->map(fn($opt) => [
                    'text' => $opt->option_text,
                    'is_correct' => $opt->is_correct,
                ])->toArray(),
                'acceptable_answers' => $question->acceptable_answers,
                'correct_answer_numeric' => $question->correct_answer_numeric,
                'tolerance' => $question->tolerance,
                'unit' => $question->unit,
                'min_words' => $question->min_words,
                'max_words' => $question->max_words,
                'explanation' => $question->explanation,
            ];
        });

        $filename = storage_path('app/exports/questions_' . time() . '.json');
        $this->ensureDirectoryExists($filename);
        file_put_contents($filename, json_encode($questions, JSON_PRETTY_PRINT));

        return $filename;
    }

    /**
     * Generate sample CSV template
     */
    public function generateCSVTemplate(): string
    {
        $filename = storage_path('app/exports/questions_template.csv');
        $this->ensureDirectoryExists($filename);
        $file = fopen($filename, 'w');

        // Header
        fputcsv($file, [
            'question_text',
            'type',
            'subject',
            'topic',
            'difficulty_level',
            'marks',
            'options',
            'correct_answers',
            'acceptable_answers',
            'correct_answer_numeric',
            'tolerance',
            'unit',
            'min_words',
            'max_words',
            'explanation',
        ]);

        // Sample MCQ
        fputcsv($file, [
            'What is 2 + 2?',
            'multiple_choice_single',
            'Mathematics',
            'Algebra',
            'easy',
            '1',
            '2|3|4|5',
            '3',
            '',
            '',
            '',
            '',
            '',
            '',
            'Basic addition',
        ]);

        // Sample True/False
        fputcsv($file, [
            'The Earth is flat.',
            'true_false',
            'Geography',
            'Earth Science',
            'easy',
            '1',
            'True|False',
            '2',
            '',
            '',
            '',
            '',
            '',
            '',
            'The Earth is a sphere',
        ]);

        // Sample Short Answer
        fputcsv($file, [
            'What is the capital of France?',
            'short_answer',
            'Geography',
            'Capitals',
            'easy',
            '1',
            '',
            '',
            'Paris|paris',
            '',
            '',
            '',
            '',
            '',
            '',
        ]);

        // Sample Numeric
        fputcsv($file, [
            'What is the value of π (pi) to 2 decimal places?',
            'numeric',
            'Mathematics',
            'Geometry',
            'medium',
            '2',
            '',
            '',
            '',
            '3.14',
            '0.01',
            '',
            '',
            '',
            'Pi is approximately 3.14159',
        ]);

        fclose($file);

        return $filename;
    }
}
