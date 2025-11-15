<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            [
                'name' => 'Mathematics',
                'code' => 'MATH',
                'description' => 'Study of numbers, quantities, shapes, and patterns',
                'is_active' => true,
            ],
            [
                'name' => 'English Language',
                'code' => 'ENG',
                'description' => 'Study of English grammar, literature, and composition',
                'is_active' => true,
            ],
            [
                'name' => 'Physics',
                'code' => 'PHY',
                'description' => 'Study of matter, energy, and their interactions',
                'is_active' => true,
            ],
            [
                'name' => 'Chemistry',
                'code' => 'CHEM',
                'description' => 'Study of matter, its properties, and transformations',
                'is_active' => true,
            ],
            [
                'name' => 'Biology',
                'code' => 'BIO',
                'description' => 'Study of living organisms and life processes',
                'is_active' => true,
            ],
            [
                'name' => 'Computer Science',
                'code' => 'CS',
                'description' => 'Study of computers, algorithms, and programming',
                'is_active' => true,
            ],
            [
                'name' => 'Economics',
                'code' => 'ECON',
                'description' => 'Study of production, distribution, and consumption of goods',
                'is_active' => true,
            ],
            [
                'name' => 'Geography',
                'code' => 'GEO',
                'description' => 'Study of Earth, its features, and inhabitants',
                'is_active' => true,
            ],
            [
                'name' => 'History',
                'code' => 'HIST',
                'description' => 'Study of past events and human civilization',
                'is_active' => true,
            ],
            [
                'name' => 'Civic Education',
                'code' => 'CIV',
                'description' => 'Study of citizenship, government, and civic responsibilities',
                'is_active' => true,
            ],
            [
                'name' => 'Literature in English',
                'code' => 'LIT',
                'description' => 'Study of literary works and critical analysis',
                'is_active' => true,
            ],
            [
                'name' => 'Agricultural Science',
                'code' => 'AGRIC',
                'description' => 'Study of farming, crops, and animal husbandry',
                'is_active' => true,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }

        $this->command->info('Subjects seeded successfully!');
    }
}
