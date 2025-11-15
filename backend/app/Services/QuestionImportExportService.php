<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class QuestionImportExportService
{
    /**
     * Ensure export directory exists
     */
    protected function ensureDirectoryExists(string $path): void
    {
        $directory = dirname($path);

        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
    }

    /**
     * Import questions from Excel
     */
    public function importFromExcel(string $filePath, int $userId): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        // Remove header row
        $header = array_shift($rows);

        $imported = [];
        $failed = [];
        $lineNumber = 1;

        foreach ($rows as $row) {
            $lineNumber++;

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

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

        return [
            'imported' => $imported,
            'failed' => $failed,
            'total' => $lineNumber - 1,
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
                'status' => 'active',
            ]);

            // Handle options for MCQ/True-False
            if (in_array($data['type'], ['multiple_choice_single', 'multiple_choice_multiple', 'true_false'])) {
                $this->createOptions($question, $data);
            }

            // Handle short answer
            if ($data['type'] === 'short_answer' && !empty($data['correct_answer_text'])) {
                $question->update([
                    'correct_answer_text' => $data['correct_answer_text'],
                    'case_sensitive' => $data['case_sensitive'] ?? false,
                ]);
            }

            // Handle numeric
            if ($data['type'] === 'numeric') {
                $question->update([
                    'correct_answer_numeric' => $data['correct_answer_numeric'],
                    'tolerance' => $data['tolerance'] ?? 0,
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
        $options = explode('|', $data['options']);
        $correctAnswers = explode(',', $data['correct_answers']);

        foreach ($options as $index => $optionText) {
            QuestionOption::create([
                'question_id' => $question->id,
                'option_key' => chr(65 + $index), // A, B, C, D...
                'option_text' => trim($optionText),
                'is_correct' => in_array((string)($index + 1), $correctAnswers),
                'display_order' => $index + 1,
            ]);
        }
    }

    /**
     * Export questions to Excel
     */
    public function exportToExcel(array $questionIds = []): string
    {
        $query = Question::with(['options', 'subject', 'topic']);

        if (!empty($questionIds)) {
            $query->whereIn('id', $questionIds);
        }

        $questions = $query->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'ID',
            'Question Text',
            'Type',
            'Subject',
            'Topic',
            'Difficulty Level',
            'Marks',
            'Options',
            'Correct Answers',
            'Correct Answer Text',
            'Correct Answer Numeric',
            'Tolerance',
            'Min Words',
            'Max Words',
            'Explanation',
        ];

        $sheet->fromArray($headers, null, 'A1');

        // Style headers
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '006F6F'],
            ],
        ];
        $sheet->getStyle('A1:O1')->applyFromArray($headerStyle);

        // Auto-size columns
        foreach(range('A','O') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add data
        $row = 2;
        foreach ($questions as $question) {
            $data = [
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
                $data[] = $optionsText;
                $data[] = $correctIndexes;
            } else {
                $data[] = '';
                $data[] = '';
            }

            // Short answer
            $data[] = $question->correct_answer_text ?? '';

            // Numeric
            $data[] = $question->correct_answer_numeric ?? '';
            $data[] = $question->tolerance ?? '';

            // Essay
            $data[] = $question->min_words ?? '';
            $data[] = $question->max_words ?? '';

            // Explanation
            $data[] = $question->explanation ?? '';

            $sheet->fromArray($data, null, 'A' . $row);
            $row++;
        }

        // Save file
        $filename = storage_path('app/public/exports/questions_' . time() . '.xlsx');
        $this->ensureDirectoryExists($filename);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filename);

        return $filename;
    }

    /**
     * Generate Excel template
     */
    public function generateExcelTemplate(): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'question_text',
            'type',
            'subject',
            'topic',
            'difficulty_level',
            'marks',
            'options',
            'correct_answers',
            'correct_answer_text',
            'correct_answer_numeric',
            'tolerance',
            'min_words',
            'max_words',
            'explanation',
        ];

        $sheet->fromArray($headers, null, 'A1');

        // Style headers
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '006F6F'],
            ],
        ];
        $sheet->getStyle('A1:N1')->applyFromArray($headerStyle);

        // Auto-size columns
        foreach(range('A','N') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add sample data
        $samples = [
            [
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
                'Basic addition',
            ],
            [
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
                'The Earth is a sphere',
            ],
            [
                'What is the capital of France?',
                'short_answer',
                'Geography',
                'Capitals',
                'easy',
                '1',
                '',
                '',
                'Paris',
                '',
                '',
                '',
                '',
                '',
            ],
            [
                'What is the value of π (pi)?',
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
                'Pi is approximately 3.14159',
            ],
        ];

        $row = 2;
        foreach ($samples as $sample) {
            $sheet->fromArray($sample, null, 'A' . $row);
            $row++;
        }

        // Save file
        $filename = storage_path('app/public/exports/questions_template.xlsx');
        $this->ensureDirectoryExists($filename);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filename);

        return $filename;
    }
}
