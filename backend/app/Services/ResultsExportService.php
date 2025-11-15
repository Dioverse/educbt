<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamResult;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ResultsExportService
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
     * Export exam results to Excel
     */
    public function exportToExcel(int $examId): string
    {
        $exam = Exam::with(['results.user', 'results.attempt'])->findOrFail($examId);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set title
        $sheet->setTitle('Exam Results');

        // Set headers
        $headers = [
            'Student Name',
            'Student ID',
            'Email',
            'Score',
            'Total Marks',
            'Percentage',
            'Grade',
            'Pass Status',
            'Time Taken (min)',
            'Correct',
            'Incorrect',
            'Unanswered',
            'Submitted At',
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
        $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);

        // Add data
        $row = 2;
        foreach ($exam->results as $result) {
            $data = [
                $result->user->name,
                $result->user->student_id,
                $result->user->email,
                $result->marks_obtained,
                $result->total_marks,
                round($result->percentage, 2),
                $result->grade,
                strtoupper($result->pass_status),
                round($result->time_taken_seconds / 60, 2),
                $result->correct_answers,
                $result->incorrect_answers,
                $result->unanswered,
                $result->created_at->format('Y-m-d H:i:s'),
            ];

            $sheet->fromArray($data, null, 'A' . $row);

            // Color code pass/fail
            $cellRange = 'H' . $row;
            if ($result->pass_status === 'pass') {
                $sheet->getStyle($cellRange)->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('90EE90');
            } else {
                $sheet->getStyle($cellRange)->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('FFB6C1');
            }

            $row++;
        }

        // Auto-size columns
        foreach(range('A','M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add summary at the bottom
        $row += 2;
        $sheet->setCellValue('A' . $row, 'Summary Statistics');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);

        $row++;
        $sheet->setCellValue('A' . $row, 'Total Students:');
        $sheet->setCellValue('B' . $row, $exam->results->count());

        $row++;
        $sheet->setCellValue('A' . $row, 'Passed:');
        $sheet->setCellValue('B' . $row, $exam->results->where('pass_status', 'pass')->count());

        $row++;
        $sheet->setCellValue('A' . $row, 'Failed:');
        $sheet->setCellValue('B' . $row, $exam->results->where('pass_status', 'fail')->count());

        $row++;
        $sheet->setCellValue('A' . $row, 'Average Score:');
        $sheet->setCellValue('B' . $row, round($exam->results->avg('marks_obtained'), 2));

        $row++;
        $sheet->setCellValue('A' . $row, 'Highest Score:');
        $sheet->setCellValue('B' . $row, $exam->results->max('marks_obtained'));

        $row++;
        $sheet->setCellValue('A' . $row, 'Lowest Score:');
        $sheet->setCellValue('B' . $row, $exam->results->min('marks_obtained'));

        // Save file
        $filename = storage_path('app/public/exports/exam_' . $examId . '_results_' . time() . '.xlsx');
        $this->ensureDirectoryExists($filename);

        $writer = new Xlsx($spreadsheet);
        $writer->save($filename);

        return $filename;
    }
}
