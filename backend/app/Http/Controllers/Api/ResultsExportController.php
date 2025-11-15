<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResultsExportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ResultsExportController extends Controller
{
    protected $exportService;

    public function __construct(ResultsExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    /**
     * Export exam results to Excel
     */
    public function export(Request $request, int $examId): JsonResponse
    {
        try {
            $filename = $this->exportService->exportToExcel($examId);

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
}
