<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamResult;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ResultsExportService
{

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

        // Set headers
        $sheet->setCellValue('A1', 'Student Name');
        $sheet->setCellValue('B1', 'Student ID');
        $sheet->setCellValue('C1', 'Email');
        $sheet->setCellValue('D1', 'Score');
        $sheet->setCellValue('E1', 'Total Marks');
        $sheet->setCellValue('F1', 'Percentage');
        $sheet->setCellValue('G1', 'Grade');
        $sheet->setCellValue('H1', 'Pass Status');
        $sheet->setCellValue('I1', 'Time Taken (min)');
        $sheet->setCellValue('J1', 'Correct');
        $sheet->setCellValue('K1', 'Incorrect');
        $sheet->setCellValue('L1', 'Unanswered');
        $sheet->setCellValue('M1', 'Submitted At');

        // Style headers
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '006F6F'],
            ],
            'color' => ['rgb' => 'FFFFFF'],
        ];
        $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);

        // Add data
        $row = 2;
        foreach ($exam->results as $result) {
            $sheet->setCellValue('A' . $row, $result->user->name);
            $sheet->setCellValue('B' . $row, $result->user->student_id);
            $sheet->setCellValue('C' . $row, $result->user->email);
            $sheet->setCellValue('D' . $row, $result->marks_obtained);
            $sheet->setCellValue('E' . $row, $result->total_marks);
            $sheet->setCellValue('F' . $row, round($result->percentage, 2) . '%');
            $sheet->setCellValue('G' . $row, $result->grade);
            $sheet->setCellValue('H' . $row, strtoupper($result->pass_status));
            $sheet->setCellValue('I' . $row, round($result->time_taken_seconds / 60, 2));
            $sheet->setCellValue('J' . $row, $result->correct_answers);
            $sheet->setCellValue('K' . $row, $result->incorrect_answers);
            $sheet->setCellValue('L' . $row, $result->unanswered);
            $sheet->setCellValue('M' . $row, $result->created_at->format('Y-m-d H:i:s'));

            // Color code pass/fail
            if ($result->pass_status === 'pass') {
                $sheet->getStyle('H' . $row)->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('90EE90');
            } else {
                $sheet->getStyle('H' . $row)->getFill()
                    ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('FFB6C1');
            }

            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Save file
        $filename = storage_path('app/exports/exam_' . $examId . '_results_' . time() . '.xlsx');
        $this->ensureDirectoryExists($filename);
        $writer = new Xlsx($spreadsheet);
        $writer->save($filename);

        return $filename;
    }

    /**
     * Export to CSV
     */
    public function exportToCSV(int $examId): string
    {
        $exam = Exam::with(['results.user'])->findOrFail($examId);

        $filename = storage_path('app/exports/exam_' . $examId . '_results_' . time() . '.csv');
        $this->ensureDirectoryExists($filename);
        $file = fopen($filename, 'w');

        // Header
        fputcsv($file, [
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
        ]);

        // Data
        foreach ($exam->results as $result) {
            fputcsv($file, [
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
            ]);
        }

        fclose($file);

        return $filename;
    }
}
