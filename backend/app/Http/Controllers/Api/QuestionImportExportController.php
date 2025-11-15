<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QuestionImportExportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class QuestionImportExportController extends Controller
{
    protected $importExportService;

    public function __construct(QuestionImportExportService $importExportService)
    {
        $this->importExportService = $importExportService;
    }

    /**
     * Import questions from file
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Excel/CSV, 10MB max
        ]);

        $successCount = 0;
        $errorCount = 0;
        $errors = [];

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $filename = 'questions_' . time() . '.' . $extension;

            // Store the file
            $path = $file->storeAs('imports', $filename);

            // Get full path using Storage facade (handles OS differences)
            $fullPath = Storage::path($path);

            // Verify file exists
            if (!file_exists($fullPath)) {
                throw new \Exception("Failed to save uploaded file");
            }

            $result = $this->importExportService->importFromExcel($fullPath, Auth::id());

            // Clean up the uploaded file
            Storage::delete($path);

            return response()->json([
                'success' => true,
                'message' => 'Import completed successfully',
                // 'message' => "{$result['success_count']} questions imported successfully" .
                //     ($result['error_count'] > 0 ? ", {$result['error_count']} failed" : ""),
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            // Clean up on error
            if (isset($path) && Storage::exists($path)) {
                Storage::delete($path);
            }

            return response()->json([
                'success' => false,
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export questions
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        try {
            $questionIds = $request->input('question_ids', []);
            $filename = $this->importExportService->exportToExcel($questionIds);

            // Generate public URL
            $publicPath = str_replace(storage_path('app/public/'), '', $filename);
            $url = asset('storage/' . $publicPath);

            return response()->json([
                'success' => true,
                'message' => 'Export completed successfully',
                'data' => [
                    'download_url' => $url,
                    'filename' => basename($filename),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download Excel template
     */
    public function downloadTemplate(): JsonResponse
    {
        try {
            $filename = $this->importExportService->generateExcelTemplate();

            // Generate public URL
            $publicPath = str_replace(storage_path('app/public/'), '', $filename);
            $url = asset('storage/' . $publicPath);

            return response()->json([
                'success' => true,
                'data' => [
                    'download_url' => $url,
                    'filename' => 'questions_template.xlsx',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate template',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
