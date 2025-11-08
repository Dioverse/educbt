<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\ExamController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    
    // Public routes
    Route::get('health', function () {
        return response()->json(['status' => 'ok', 'message' => 'CBT API is running']);
    });

    // Protected routes
    Route::middleware(['auth:sanctum'])->group(function () {
        
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
    });
});