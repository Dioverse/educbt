<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            SubjectSeeder::class,
            GradeLevelSeeder::class,
            TopicSeeder::class,
            QuestionSeeder::class,
            RubricSeeder::class,
        ]);

        $this->command->info('🎉 All seeders completed successfully!');
        $this->command->info('');
        $this->command->info('📝 Test Accounts:');
        $this->command->info('Admin: admin@cbt.com / password');
        $this->command->info('Instructor: john@cbt.com / password');
        $this->command->info('Student: alice@student.com / password');
    }
}
