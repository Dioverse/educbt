<?php

namespace App\Services;

use App\Models\ExamResult;
use App\Models\Exam;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ResultService
{
    public function getExamResults(int $examId)
    {
        // Return ALL results, not just published ones
        // Frontend can filter by published status if needed
        return ExamResult::with([
            'user:id,name,email',
            'exam:id,title,total_marks',
        ])
            ->where('exam_id', $examId)
            // REMOVED: ->where('is_published', true)
            ->orderBy('percentage', 'desc')
            ->get();
    }

    public function getAttemptResult(int $attemptId)
    {
        return ExamResult::with([
            'user',
            'exam',
            'examAttempt.answers.question',
            'examAttempt.answers.selectedOption',
        ])
            ->where('exam_attempt_id', $attemptId)
            ->firstOrFail();
    }

    public function getResultStatistics(int $examId): array
    {
        // Calculate stats from ALL results (published and unpublished)
        $results = ExamResult::where('exam_id', $examId)->get();

        $totalAttempts = $results->count();

        if ($totalAttempts === 0) {
            return [
                'total_attempts' => 0,
                'average_score' => 0,
                'pass_rate' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
            ];
        }

        $averageScore = $results->avg('percentage');
        $passCount = $results->where('pass_status', 'pass')->count();
        $passRate = ($passCount / $totalAttempts) * 100;
        $highestScore = $results->max('percentage');
        $lowestScore = $results->min('percentage');

        return [
            'total_attempts' => $totalAttempts,
            'average_score' => round($averageScore, 2),
            'pass_rate' => round($passRate, 2),
            'highest_score' => round($highestScore, 2),
            'lowest_score' => round($lowestScore, 2),
        ];
    }

    public function getStudentResults(int $userId)
    {
        // For students viewing their own results, only show published ones
        return ExamResult::with(['exam:id,title,total_marks'])
            ->where('user_id', $userId)
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get();
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

    public function exportToExcel(int $examId): string
    {
        $exam = Exam::findOrFail($examId);

        // Export ALL results, not just published
        $results = ExamResult::with(['user'])
            ->where('exam_id', $examId)
            ->orderBy('percentage', 'desc')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator('CBT System')
            ->setTitle($exam->title . ' - Results')
            ->setSubject('Exam Results')
            ->setDescription('Results for ' . $exam->title);

        // Set sheet title
        $sheet->setTitle('Results');

        // Header styling
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0D9488'],
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];

        // Title row
        $sheet->setCellValue('A1', $exam->title . ' - Results');
        $sheet->mergeCells('A1:K1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => '0D9488'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension('1')->setRowHeight(30);

        // Info rows
        $sheet->setCellValue('A2', 'Export Date:');
        $sheet->setCellValue('B2', now()->format('Y-m-d H:i:s'));
        $sheet->setCellValue('A3', 'Total Students:');
        $sheet->setCellValue('B3', $results->count());

        // Headers
        $headers = [
            'A5' => 'Rank',
            'B5' => 'Student Name',
            'C5' => 'Email',
            'D5' => 'Total Marks',
            'E5' => 'Marks Obtained',
            'F5' => 'Percentage (%)',
            'G5' => 'Grade',
            'H5' => 'Status',
            'I5' => 'Published',
            'J5' => 'Time Taken (min)',
            'K5' => 'Submitted At',
        ];

        foreach ($headers as $cell => $header) {
            $sheet->setCellValue($cell, $header);
        }

        $sheet->getStyle('A5:K5')->applyFromArray($headerStyle);
        $sheet->getRowDimension('5')->setRowHeight(25);

        // Data rows
        $row = 6;
        $rank = 1;

        foreach ($results as $result) {
            $sheet->setCellValue('A' . $row, $rank);
            $sheet->setCellValue('B' . $row, $result->user->name ?? 'N/A');
            $sheet->setCellValue('C' . $row, $result->user->email ?? 'N/A');
            $sheet->setCellValue('D' . $row, $result->total_marks);
            $sheet->setCellValue('E' . $row, $result->marks_obtained);
            $sheet->setCellValue('F' . $row, round($result->percentage, 2));
            $sheet->setCellValue('G' . $row, $result->grade);
            $sheet->setCellValue('H' . $row, ucfirst($result->pass_status));
            $sheet->setCellValue('I' . $row, $result->is_published ? 'Yes' : 'No');
            $sheet->setCellValue('J' . $row, $result->time_taken_seconds ? round($result->time_taken_seconds / 60, 1) : '-');
            $sheet->setCellValue('K' . $row, $result->created_at->format('Y-m-d H:i:s'));

            // Color code pass/fail
            $statusColor = $result->pass_status === 'pass' ? 'C6EFCE' : 'FFC7CE';
            $sheet->getStyle('H' . $row)->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $statusColor],
                ],
            ]);

            // Color code published status
            $publishedColor = $result->is_published ? 'C6EFCE' : 'FFE699';
            $sheet->getStyle('I' . $row)->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $publishedColor],
                ],
            ]);

            // Color code grades
            $gradeColors = [
                'A+' => 'C6EFCE',
                'A' => 'C6EFCE',
                'B+' => 'FFEB9C',
                'B' => 'FFEB9C',
                'C' => 'FFD966',
                'D' => 'F4B183',
                'F' => 'FFC7CE',
            ];

            if (isset($gradeColors[$result->grade])) {
                $sheet->getStyle('G' . $row)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $gradeColors[$result->grade]],
                    ],
                ]);
            }

            $rank++;
            $row++;
        }

        // Add borders to all data
        $sheet->getStyle('A5:K' . ($row - 1))->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        // Auto-size columns
        foreach (range('A', 'K') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Summary statistics at bottom
        $summaryRow = $row + 2;
        $stats = $this->getResultStatistics($examId);

        $sheet->setCellValue('A' . $summaryRow, 'Summary Statistics');
        $sheet->mergeCells('A' . $summaryRow . ':B' . $summaryRow);
        $sheet->getStyle('A' . $summaryRow)->getFont()->setBold(true);

        $summaryRow++;
        $sheet->setCellValue('A' . $summaryRow, 'Average Score:');
        $sheet->setCellValue('B' . $summaryRow, $stats['average_score'] . '%');

        $summaryRow++;
        $sheet->setCellValue('A' . $summaryRow, 'Pass Rate:');
        $sheet->setCellValue('B' . $summaryRow, $stats['pass_rate'] . '%');

        $summaryRow++;
        $sheet->setCellValue('A' . $summaryRow, 'Highest Score:');
        $sheet->setCellValue('B' . $summaryRow, $stats['highest_score'] . '%');

        $summaryRow++;
        $sheet->setCellValue('A' . $summaryRow, 'Lowest Score:');
        $sheet->setCellValue('B' . $summaryRow, $stats['lowest_score'] . '%');

        // Generate filename
        $filename = 'exam_results_' . $examId . '_' . time() . '.xlsx';
        $filePath = storage_path('app/temp/' . $filename);

        // Create directory if it doesn't exist
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Save file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return $filePath;
    }
}
