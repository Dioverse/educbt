<?php

namespace App\Jobs;

use App\Services\ResultsExportService;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class ExportResultsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $examId;
    protected $format;
    protected $userId;

    public function __construct(int $examId, string $format, int $userId)
    {
        $this->examId = $examId;
        $this->format = $format;
        $this->userId = $userId;
    }

    public function handle(ResultsExportService $service): void
    {
        $filename = match($this->format) {
            'csv' => $service->exportToCSV($this->examId),
            'excel' => $service->exportToExcel($this->examId),
        };

        // Send email notification
        // Mail::to(User::find($this->userId)->email)->send(new ExportReadyMail($filename));
    }
}
