<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GradingRubric;
use App\Models\RubricCriterion;
use App\Models\User;

class RubricSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('role', 'instructor')->first();

        if (!$instructor) {
            $this->command->warn('Instructor not found. Run UserSeeder first.');
            return;
        }

        // Essay Grading Rubric
        $essayRubric = GradingRubric::create([
            'name' => 'Standard Essay Rubric',
            'description' => 'General rubric for grading essay questions',
            'question_type' => 'essay',
            'max_score' => 10,
            'is_default' => true,
            'created_by' => $instructor->id,
        ]);

        $essayCriteria = [
            [
                'criterion_name' => 'Content & Relevance',
                'description' => 'How well does the answer address the question?',
                'max_points' => 4,
                'weight_percentage' => 40,
            ],
            [
                'criterion_name' => 'Organization & Structure',
                'description' => 'Is the essay well-organized with clear introduction, body, and conclusion?',
                'max_points' => 2,
                'weight_percentage' => 20,
            ],
            [
                'criterion_name' => 'Grammar & Language',
                'description' => 'Quality of grammar, spelling, and vocabulary',
                'max_points' => 2,
                'weight_percentage' => 20,
            ],
            [
                'criterion_name' => 'Critical Thinking',
                'description' => 'Depth of analysis and original thinking',
                'max_points' => 2,
                'weight_percentage' => 20,
            ],
        ];

        foreach ($essayCriteria as $index => $criterion) {
            RubricCriterion::create([
                'rubric_id' => $essayRubric->id,
                'criterion_name' => $criterion['criterion_name'],
                'description' => $criterion['description'],
                'max_points' => $criterion['max_points'],
                'weight_percentage' => $criterion['weight_percentage'],
                'display_order' => $index + 1,
            ]);
        }

        // Short Answer Rubric
        $shortAnswerRubric = GradingRubric::create([
            'name' => 'Short Answer Rubric',
            'description' => 'Rubric for grading short answer questions',
            'question_type' => 'short_answer',
            'max_score' => 5,
            'is_default' => true,
            'created_by' => $instructor->id,
        ]);

        $shortAnswerCriteria = [
            [
                'criterion_name' => 'Accuracy',
                'description' => 'Correctness of the answer',
                'max_points' => 3,
                'weight_percentage' => 60,
            ],
            [
                'criterion_name' => 'Completeness',
                'description' => 'How complete is the answer?',
                'max_points' => 2,
                'weight_percentage' => 40,
            ],
        ];

        foreach ($shortAnswerCriteria as $index => $criterion) {
            RubricCriterion::create([
                'rubric_id' => $shortAnswerRubric->id,
                'criterion_name' => $criterion['criterion_name'],
                'description' => $criterion['description'],
                'max_points' => $criterion['max_points'],
                'weight_percentage' => $criterion['weight_percentage'],
                'display_order' => $index + 1,
            ]);
        }

        $this->command->info('Rubrics seeded successfully!');
    }
}
