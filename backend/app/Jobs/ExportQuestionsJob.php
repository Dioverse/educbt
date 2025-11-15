<?php

namespace App\Jobs;

use App\Services\QuestionImportExportService;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class ExportQuestionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $format;
    protected $questionIds;
    protected $userId;

    public function __construct(string $format, array $questionIds, int $userId)
    {
        $this->format = $format;
        $this->questionIds = $questionIds;
        $this->userId = $userId;
    }

    public function handle(QuestionImportExportService $service): void
    {
        $filename = match($this->format) {
            'csv' => $service->exportToCSV($this->questionIds),
            'json' => $service->exportToJSON($this->questionIds),
        };

        $user = User::find($this->userId);

        // Send email with download link
        // Mail::to($user->email)->send(new ExportReadyMail($filename));
    }
}
