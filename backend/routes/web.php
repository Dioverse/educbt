<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


// routes/web.php or api.php
Route::get('/test-grade/{attemptId}', function ($attemptId) {
    $attempt = \App\Models\ExamAttempt::with('exam.examQuestions.question.options')->findOrFail($attemptId);

    $exam = $attempt->exam;
    $answers = \App\Models\ExamAnswer::where('exam_attempt_id', $attemptId)->get();

    return [
        'exam_id' => $exam->id,
        'exam_questions_count' => $exam->examQuestions->count(),
        'answers_count' => $answers->count(),
        'exam_data' => [
            'total_marks' => $exam->total_marks,
            'pass_marks' => $exam->pass_marks,
            'enable_negative_marking' => $exam->enable_negative_marking,
        ],
        'sample_question' => $exam->examQuestions->first(),
        'sample_answer' => $answers->first(),
    ];
});
