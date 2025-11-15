<?php

use App\Http\Controllers\Api\Admin\AdminAnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExamAttemptController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\GradingController;
use App\Http\Controllers\Api\LiveProctoringController;
use App\Http\Controllers\Api\QuestionImportExportController;
use App\Http\Controllers\Api\ResultController;
use App\Http\Controllers\Api\ResultsExportController;
use App\Http\Controllers\Api\RubricController;
use App\Http\Controllers\Api\StudentExamController;
use App\Http\Controllers\Api\UserImportController;
use App\Models\RubricCriterion;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('v1')->group(function () {

    // Public routes
    Route::middleware(['rate.limit:10,1'])->group(function () {
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/register-admin', [AuthController::class, 'registerAdmin']);
        Route::get('health', function () {
            return response()->json(['status' => 'ok', 'message' => 'CBT API is running']);
        });
    });



    // Import/Export Routes
    Route::middleware(['auth:sanctum', 'check.role:admin,supervisor'])->group(function () {
        // Question Import/Export
        Route::post('/questions/import', [QuestionImportExportController::class, 'import']);
        Route::post('/questions/export', [QuestionImportExportController::class, 'export']);
        Route::get('/questions/template', [QuestionImportExportController::class, 'downloadTemplate']);

        // Results Export
        Route::post('/exams/{examId}/export-results', [ResultsExportController::class, 'export']);

        Route::get('/proctoring/live-sessions', [LiveProctoringController::class, 'getLiveSessions']);

        // Get attempt proctoring data
        Route::get('/proctoring/attempt/{attemptId}', [LiveProctoringController::class, 'getAttemptEvents']);

        // Terminate attempt
        Route::post('/proctoring/terminate/{attemptId}', [LiveProctoringController::class, 'terminateAttempt']);
    });

    // Protected routes
    Route::middleware(['auth:sanctum', 'rate.limit:60,1'])->group(function () {

        // Auth routes
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

        Route::middleware(['rate.limit:5,1'])->group(function () {
            Route::post('/questions/import', [QuestionImportExportController::class, 'import']);
            Route::post('/questions/export', [QuestionImportExportController::class, 'export']);
            Route::post('/exams/{examId}/export-results', [ResultsExportController::class, 'export']);
        });

        // User import routes (admin only)
        Route::middleware(['check.role:admin'])->group(function () {
            Route::post('/users/import/students', [UserImportController::class, 'importStudents']);
            Route::post('/users/import/students/file', [UserImportController::class, 'importStudentsFromFile']);

            // Supervisors
            Route::post('/users/import/supervisors/file', [UserImportController::class, 'importSupervisorsFromFile']); // File upload


            Route::post('/users/import/supervisors', [UserImportController::class, 'importSupervisors']);
            Route::get('/users/role/{role}', [UserImportController::class, 'getUsersByRole']);
            Route::patch('/users/{userId}/toggle-status', [UserImportController::class, 'toggleUserStatus']);
        });

        // Questions
        Route::prefix('questions')->group(function () {
            Route::get('/', [QuestionController::class, 'index']);
            Route::post('/', [QuestionController::class, 'store']);
            Route::get('/statistics', [QuestionController::class, 'statistics']);
            Route::get('/{id}', [QuestionController::class, 'show']);
            Route::put('/{id}', [QuestionController::class, 'update']);
            Route::delete('/{id}', [QuestionController::class, 'destroy']);

            // Question actions
            Route::post('/{id}/duplicate', [QuestionController::class, 'duplicate']);
            Route::post('/{id}/verify', [QuestionController::class, 'verify']);
            Route::post('/{id}/unverify', [QuestionController::class, 'unverify']);
            Route::post('/{id}/toggle-active', [QuestionController::class, 'toggleActive']);

            // Bulk operations
            Route::post('/bulk-delete', [QuestionController::class, 'bulkDelete']);
            Route::post('/bulk-update-tags', [QuestionController::class, 'bulkUpdateTags']);
        });

        // Subjects
        Route::apiResource('subjects', SubjectController::class);

        // Topics
        Route::apiResource('topics', TopicController::class);

        // Media uploads
        Route::prefix('media')->group(function () {
            Route::post('/upload', [MediaController::class, 'uploadQuestionAttachment']);
            Route::delete('/attachments/{id}', [MediaController::class, 'deleteAttachment']);
        });

        // Exams
        Route::prefix('exams')->group(function () {
            Route::get('/', [ExamController::class, 'index']);
            Route::post('/', [ExamController::class, 'store']);
            Route::get('/statistics', [ExamController::class, 'statistics']);
            Route::get('/upcoming', [ExamController::class, 'upcoming']);
            Route::get('/ongoing', [ExamController::class, 'ongoing']);
            Route::get('/{id}', [ExamController::class, 'show']);
            Route::put('/{id}', [ExamController::class, 'update']);
            Route::delete('/{id}', [ExamController::class, 'destroy']);

            // Exam actions
            Route::post('/{id}/duplicate', [ExamController::class, 'duplicate']);
            Route::post('/{id}/publish', [ExamController::class, 'publish']);
            Route::post('/{id}/activate', [ExamController::class, 'activate']);
            Route::post('/{id}/archive', [ExamController::class, 'archive']);

            // Question management
            Route::post('/{id}/questions', [ExamController::class, 'addQuestions']);
            Route::delete('/{examId}/questions/{examQuestionId}', [ExamController::class, 'removeQuestion']);
            Route::post('/{id}/questions/reorder', [ExamController::class, 'reorderQuestions']);
        });

        Route::prefix('grading')->group(function () {
            Route::get('pending', [GradingController::class, 'getPendingGrading']);
            Route::post('answers/{answerId}/grade', [GradingController::class, 'gradeAnswer']);
            Route::post('bulk-grade', [GradingController::class, 'bulkGrade']);
            Route::post('publish-results', [GradingController::class, 'publishResults']);
            Route::get('statistics', [GradingController::class, 'getGradingStatistics']);
        });

        Route::middleware(['auth:sanctum', 'check.role:admin,supervisor'])->group(function () {
            Route::get('/exams/{examId}/live-sessions', [LiveProctoringController::class, 'getLiveSessions']);
            Route::get('/live-sessions/{attemptId}', [LiveProctoringController::class, 'getSessionDetails']);
            Route::post('/live-sessions/{attemptId}/flag', [LiveProctoringController::class, 'flagStudent']);
            Route::post('/live-sessions/{attemptId}/terminate', [LiveProctoringController::class, 'terminateExam']);

            Route::get('/analytics/dashboard', [AdminAnalyticsController::class, 'getDashboardAnalytics']);
            Route::get('/analytics/user-growth', [AdminAnalyticsController::class, 'getUserGrowth']);
            Route::get('/analytics/exam-performance', [AdminAnalyticsController::class, 'getExamPerformance']);
            Route::get('/analytics/recent-activity', [AdminAnalyticsController::class, 'getRecentActivity']);

            Route::post('/rubrics', [RubricController::class, 'store']);
            Route::put('/rubrics/{id}', [RubricController::class, 'update']);
            Route::delete('/rubrics/{id}', [RubricController::class, 'destroy']);

            Route::get('/rubrics/{id}', [RubricController::class, 'show']);
            Route::get('/rubrics', [RubricController::class, 'index']);
        });
    });

    Route::prefix('results')->group(function () {
        // Get student's own results
        Route::get('/my-results', [ResultController::class, 'getMyResults']);

        // Get attempt result details
        Route::get('/attempts/{attemptId}', [ResultController::class, 'getAttemptResult']);
    });

    // Exam Results Routes
    Route::prefix('exams/{examId}')->group(function () {
        // Get all results for an exam
        Route::get('/results', [ResultController::class, 'getExamResults']);

        // Get result statistics
        Route::get('/results/statistics', [ResultController::class, 'getResultStatistics']);

        // Export results to Excel
        Route::get('/results/export', [ResultController::class, 'exportExamResults']);

        // Publish/unpublish results
        Route::post('/results/publish', [ResultController::class, 'publishResults']);
    });

    // Grading Routes
    Route::prefix('grading')->group(function () {
        Route::get('/pending', [GradingController::class, 'getPendingGrading']);
        Route::get('/statistics', [GradingController::class, 'getGradingStatistics']);
        Route::get('/answers/{answerId}', [GradingController::class, 'getAnswerForGrading']);
        Route::post('/answers/{answerId}/grade', [GradingController::class, 'gradeAnswer']);
        Route::post('/bulk-grade', [GradingController::class, 'bulkGrade']);
        Route::post('/publish-results', [GradingController::class, 'publishResults']);
    });

    Route::middleware(['auth:sanctum', 'check.role:student'])->group(function () {
        Route::post('/exam-attempts/{attemptId}/heartbeat', [LiveProctoringController::class, 'heartbeat']);
        Route::post('/exam-attempts/{attemptId}/log-event', [LiveProctoringController::class, 'logEvent']);
    });

    // Rubrics
    // Route::apiResource('rubrics', RubricCriterion::class);


    // Student Exam Routes
    // Student Exam Routes
    // Student Exam Routes
    Route::middleware(['auth:sanctum', 'check.role:student'])->group(function () {
        // Available exams
        Route::get('/student/exams', [ExamAttemptController::class, 'getAvailableExams']);

        // My attempts
        Route::get('/student/my-attempts', [ExamAttemptController::class, 'getMyAttempts']);

        // Get exam details for student
        Route::get('/student/exams/{examId}', [ExamAttemptController::class, 'getExamForStudent']);

        // Start exam
        Route::post('/student/exams/{examId}/start', [ExamAttemptController::class, 'startAttempt']);

        Route::get('/student/attempts/{attemptId}/session', [StudentExamController::class, 'getExamSession']);

        // Get attempt details
        Route::get('/student/attempts/{attemptId}', [ExamAttemptController::class, 'getAttempt']);

        // Save answer
        Route::post('/student/attempts/{attemptId}/answer', [ExamAttemptController::class, 'saveAnswer']);

        // Submit exam
        Route::post('/student/attempts/{attemptId}/submit', [ExamAttemptController::class, 'submitAttempt']);

        // Get result
        Route::get('/student/attempts/{attemptId}/result', [ExamAttemptController::class, 'getResult']);

        // Heartbeat and events
        Route::post('/exam-attempts/{attemptId}/heartbeat', [LiveProctoringController::class, 'heartbeat']);
        Route::post('/exam-attempts/{attemptId}/log-event', [LiveProctoringController::class, 'logEvent']);

        Route::post('/student/proctoring/log', [LiveProctoringController::class, 'logEvent']);
    });


    // Route::prefix('student')->middleware(['auth:sanctum'])->group(function () {
    //     // Available exams
    //     Route::get('exams/available', [StudentExamController::class, 'availableExams']);
    //     Route::get('exams/my-attempts', [StudentExamController::class, 'myAttempts']);

    //     // Exam eligibility and start
    //     Route::get('exams/{examId}/eligibility', [StudentExamController::class, 'checkEligibility']);
    //     Route::post('exams/{examId}/start', [StudentExamController::class, 'startExam']);
    //     Route::post('attempts/{attemptId}/resume', [StudentExamController::class, 'resumeExam']);

    //     // Active exam session
    //     Route::get('attempts/{attemptId}/session', [StudentExamController::class, 'getExamSession']);
    //     Route::post('attempts/{attemptId}/answer', [StudentExamController::class, 'saveAnswer']);
    //     Route::post('attempts/{attemptId}/progress', [StudentExamController::class, 'updateProgress']);
    //     Route::post('attempts/{attemptId}/proctoring-event', [StudentExamController::class, 'logProctoringEvent']);

    //     // Submit and results
    //     Route::post('attempts/{attemptId}/submit', [StudentExamController::class, 'submitExam']);
    //     Route::get('attempts/{attemptId}/result', [StudentExamController::class, 'getResult']);
    // });
});
