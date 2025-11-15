<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Topic;

class TopicSeeder extends Seeder
{
    public function run(): void
    {
        $topics = [
            // Mathematics Topics
            'MATH' => [
                'Algebra',
                'Geometry',
                'Trigonometry',
                'Calculus',
                'Statistics',
                'Probability',
                'Number Theory',
                'Linear Equations',
                'Quadratic Equations',
                'Functions',
            ],

            // English Topics
            'ENG' => [
                'Grammar',
                'Comprehension',
                'Essay Writing',
                'Letter Writing',
                'Oral English',
                'Lexis and Structure',
                'Summary Writing',
                'Punctuation',
                'Parts of Speech',
                'Vocabulary',
            ],

            // Physics Topics
            'PHY' => [
                'Mechanics',
                'Heat and Thermodynamics',
                'Waves and Optics',
                'Electricity and Magnetism',
                'Modern Physics',
                'Nuclear Physics',
                'Kinematics',
                'Dynamics',
                'Energy and Power',
                'Sound',
            ],

            // Chemistry Topics
            'CHEM' => [
                'Atomic Structure',
                'Chemical Bonding',
                'Acids and Bases',
                'Electrochemistry',
                'Organic Chemistry',
                'Inorganic Chemistry',
                'Periodic Table',
                'Chemical Reactions',
                'Stoichiometry',
                'Thermochemistry',
            ],

            // Biology Topics
            'BIO' => [
                'Cell Biology',
                'Genetics',
                'Evolution',
                'Ecology',
                'Human Anatomy',
                'Plant Biology',
                'Microbiology',
                'Photosynthesis',
                'Reproduction',
                'Biodiversity',
            ],

            // Computer Science Topics
            'CS' => [
                'Programming Fundamentals',
                'Data Structures',
                'Algorithms',
                'Database Systems',
                'Web Development',
                'Operating Systems',
                'Computer Networks',
                'Software Engineering',
                'Artificial Intelligence',
                'Cybersecurity',
            ],
        ];

        foreach ($topics as $subjectCode => $subjectTopics) {
            $subject = Subject::where('code', $subjectCode)->first();

            if ($subject) {
                foreach ($subjectTopics as $index => $topicName) {
                    Topic::create([
                        'subject_id' => $subject->id,
                        'name' => $topicName,
                        'description' => "Study of {$topicName} in {$subject->name}",
                        'display_order' => $index + 1,
                    ]);
                }
            }
        }

        $this->command->info('Topics seeded successfully!');
    }
}
