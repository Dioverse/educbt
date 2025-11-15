<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GradeLevel;

class GradeLevelSeeder extends Seeder
{
    public function run(): void
    {
        $gradeLevels = [
            ['name' => 'JSS 1', 'code' => 'JSS1', 'is_active' => 1, 'description' => 'Junior Secondary School 1'],
            ['name' => 'JSS 2', 'code' => 'JSS2', 'is_active' => 1, 'description' => 'Junior Secondary School 2'],
            ['name' => 'JSS 3', 'code' => 'JSS3', 'is_active' => 1, 'description' => 'Junior Secondary School 3'],
            ['name' => 'SS 1', 'code' => 'SS1', 'is_active' => 1, 'description' => 'Senior Secondary School 1'],
            ['name' => 'SS 2', 'code' => 'SS2', 'is_active' => 1, 'description' => 'Senior Secondary School 2'],
            ['name' => 'SS 3', 'code' => 'SS3', 'is_active' => 1, 'description' => 'Senior Secondary School 3'],
            ['name' => 'Year 7', 'code' => 'Y7', 'is_active' => 1, 'description' => 'Year 7'],
            ['name' => 'Year 8', 'code' => 'Y8', 'is_active' => 1, 'description' => 'Year 8'],
            ['name' => 'Year 9', 'code' => 'Y9', 'is_active' => 1, 'description' => 'Year 9'],
            ['name' => 'Year 10', 'code' => 'Y10', 'is_active' => 1, 'description' => 'Year 10'],
            ['name' => 'Year 11', 'code' => 'Y11', 'is_active' => 1, 'description' => 'Year 11'],
            ['name' => 'Year 12', 'code' => 'Y12', 'is_active' => 1, 'description' => 'Year 12'],
        ];

        foreach ($gradeLevels as $level) {
            GradeLevel::create($level);
        }

        $this->command->info('Grade levels seeded successfully!');
    }
}
