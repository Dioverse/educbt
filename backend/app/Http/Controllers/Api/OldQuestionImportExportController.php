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
            'file' => 'required|file|mimes:csv,json|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $path = $file->storeAs('imports', 'questions_' . time() . '.' . $extension);
            $fullPath = storage_path('app/' . $path);

            $result = match($extension) {
                'csv' => $this->importExportService->importFromCSV($fullPath, Auth::id()),
                'json' => $this->importExportService->importFromJSON($fullPath, Auth::id()),
                default => throw new \Exception('Unsupported file type'),
            };

            // Clean up
            Storage::delete($path);

            return response()->json([
                'success' => true,
                'message' => "{$result['success_count']} questions imported successfully",
                'data' => $result,
            ]);

        } catch (\Exception $e) {
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
            'format' => 'required|in:csv,json',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:questions,id',
        ]);

        try {
            $questionIds = $request->input('question_ids', []);

            $filename = match($request->format) {
                'csv' => $this->importExportService->exportToCSV($questionIds),
                'json' => $this->importExportService->exportToJSON($questionIds),
            };

            $url = Storage::url(str_replace(storage_path('app/'), '', $filename));

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
     * Download CSV template
     */
    public function downloadTemplate(): JsonResponse
    {
        try {
            $filename = $this->importExportService->generateCSVTemplate();
            $url = Storage::url(str_replace(storage_path('app/'), '', $filename));

            return response()->json([
                'success' => true,
                'data' => [
                    'download_url' => $url,
                    'filename' => 'questions_template.csv',
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
