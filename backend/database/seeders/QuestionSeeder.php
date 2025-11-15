<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $mathSubject = Subject::where('code', 'MATH')->first();
        $algebraTopic = Topic::where('name', 'Algebra')->first();
        $instructor = User::where('role', 'instructor')->first();

        if (!$mathSubject || !$algebraTopic || !$instructor) {
            $this->command->warn('Required data not found. Run other seeders first.');
            return;
        }

        // Sample Multiple Choice Question
        $mcq = Question::create([
            'question_text' => 'What is the value of x in the equation: 2x + 5 = 15?',
            'type' => 'multiple_choice_single',
            'subject_id' => $mathSubject->id,
            'topic_id' => $algebraTopic->id,
            'difficulty_level' => 'easy',
            'marks' => 2,
            'created_by' => $instructor->id,
            'status' => 'approved',
        ]);

        // Create options
        $options = [
            ['option_text' => '3', 'is_correct' => false, 'display_order' => 1],
            ['option_text' => '5', 'is_correct' => true, 'display_order' => 2],
            ['option_text' => '7', 'is_correct' => false, 'display_order' => 3],
            ['option_text' => '10', 'is_correct' => false, 'display_order' => 4],
        ];

        foreach ($options as $option) {
            QuestionOption::create([
                'question_id' => $mcq->id,
                'option_text' => $option['option_text'],
                'is_correct' => $option['is_correct'],
                'display_order' => $option['display_order'],
            ]);
        }

        // Sample True/False Question
        $tfq = Question::create([
            'question_text' => 'The square root of 16 is 4.',
            'type' => 'true_false',
            'subject_id' => $mathSubject->id,
            'topic_id' => $algebraTopic->id,
            'difficulty_level' => 'easy',
            'marks' => 1,
            'created_by' => $instructor->id,
            'status' => 'approved',
        ]);

        QuestionOption::create([
            'question_id' => $tfq->id,
            'option_text' => 'true',
            'is_correct' => true,
            'display_order' => 1,
        ]);

        QuestionOption::create([
            'question_id' => $tfq->id,
            'option_text' => 'false',
            'is_correct' => false,
            'display_order' => 2,
        ]);

        // Sample Short Answer Question
        Question::create([
            'question_text' => 'What is the formula for the area of a circle?',
            'type' => 'short_answer',
            'subject_id' => $mathSubject->id,
            'difficulty_level' => 'easy',
            'marks' => 2,
            'acceptable_answers' => ['πr²', 'pi*r^2', 'πr^2', 'pi*r*r'],
            'is_case_sensitive' => false,
            'created_by' => $instructor->id,
            'status' => 'approved',
        ]);

        // Sample Numeric Question
        Question::create([
            'question_text' => 'If a triangle has a base of 10 cm and a height of 8 cm, what is its area in cm²?',
            'type' => 'numeric',
            'subject_id' => $mathSubject->id,
            'difficulty_level' => 'medium',
            'marks' => 3,
            'correct_answer_numeric' => 40,
            'tolerance' => 0,
            'unit' => 'cm²',
            'created_by' => $instructor->id,
            'status' => 'approved',
        ]);

        // Sample Essay Question
        Question::create([
            'question_text' => 'Explain the Pythagorean theorem and provide an example of its application in real life.',
            'type' => 'essay',
            'subject_id' => $mathSubject->id,
            'difficulty_level' => 'hard',
            'marks' => 10,
            'min_words' => 100,
            'max_words' => 500,
            'created_by' => $instructor->id,
            'status' => 'approved',
        ]);

        $this->command->info('Sample questions seeded successfully!');
    }
}
