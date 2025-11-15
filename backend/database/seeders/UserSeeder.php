<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@cbt.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Supervisor Users
        $supervisors = [
            ['name' => 'John Supervisor', 'email' => 'john@cbt.com', 'staff_id' => 'STAFF001'],
            ['name' => 'Jane Teacher', 'email' => 'jane@cbt.com', 'staff_id' => 'STAFF002'],
            ['name' => 'Mike Professor', 'email' => 'mike@cbt.com', 'staff_id' => 'STAFF003'],
        ];

        foreach ($supervisors as $supervisor) {
            User::create([
                'name' => $supervisor['name'],
                'email' => $supervisor['email'],
                'password' => Hash::make('password'),
                'role' => 'supervisor',
                'staff_id' => $supervisor['staff_id'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // Create Student Users
        $students = [
            ['name' => 'Alice Student', 'email' => 'alice@student.com', 'student_id' => 'STU001'],
            ['name' => 'Bob Student', 'email' => 'bob@student.com', 'student_id' => 'STU002'],
            ['name' => 'Carol Student', 'email' => 'carol@student.com', 'student_id' => 'STU003'],
            ['name' => 'David Student', 'email' => 'david@student.com', 'student_id' => 'STU004'],
            ['name' => 'Emma Student', 'email' => 'emma@student.com', 'student_id' => 'STU005'],
            ['name' => 'Frank Student', 'email' => 'frank@student.com', 'student_id' => 'STU006'],
            ['name' => 'Grace Student', 'email' => 'grace@student.com', 'student_id' => 'STU007'],
            ['name' => 'Henry Student', 'email' => 'henry@student.com', 'student_id' => 'STU008'],
            ['name' => 'Ivy Student', 'email' => 'ivy@student.com', 'student_id' => 'STU009'],
            ['name' => 'Jack Student', 'email' => 'jack@student.com', 'student_id' => 'STU010'],
        ];

        foreach ($students as $student) {
            User::create([
                'name' => $student['name'],
                'email' => $student['email'],
                'password' => Hash::make('password'),
                'role' => 'student',
                'student_id' => $student['student_id'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        $this->command->info('Users seeded successfully!');
        $this->command->info('');
        $this->command->info('📝 Test Accounts (All passwords: password):');
        $this->command->info('Admin: admin@cbt.com');
        $this->command->info('Supervisor: john@cbt.com');
        $this->command->info('Student: alice@student.com');
    }
}
