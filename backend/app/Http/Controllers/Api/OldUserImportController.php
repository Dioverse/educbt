<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserImportController extends Controller
{
    /**
     * Import students from CSV/Excel file
     */
    public function importStudentsFromFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        try {
            $students = [];

            if ($extension === 'csv') {
                $students = $this->parseCSV($file);
            } else {
                // For Excel files, you'll need PhpSpreadsheet
                $students = $this->parseExcel($file);
            }

            if (empty($students)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid student data found in file',
                ], 400);
            }

            return $this->processStudentImport($students);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing file: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse CSV file
     */
    private function parseCSV($file): array
    {
        $students = [];
        $handle = fopen($file->getRealPath(), 'r');

        // Get headers
        $headers = fgetcsv($handle);
        $headers = array_map('trim', $headers);

        // Validate headers
        $requiredHeaders = ['name', 'email', 'student_id'];
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            fclose($handle);
            throw new \Exception('Missing required headers: ' . implode(', ', $missingHeaders));
        }

        // Parse rows
        while (($row = fgetcsv($handle)) !== false) {
            if (empty(array_filter($row))) continue; // Skip empty rows

            $student = [];
            foreach ($headers as $index => $header) {
                $student[$header] = isset($row[$index]) ? trim($row[$index]) : '';
            }

            // Only add if required fields are present
            if (!empty($student['name']) && !empty($student['email']) && !empty($student['student_id'])) {
                $students[] = $student;
            }
        }

        fclose($handle);
        return $students;
    }

    /**
     * Parse Excel file using PhpSpreadsheet
     */
    private function parseExcel($file): array
    {
        // You need to install: composer require phpoffice/phpspreadsheet

        if (!class_exists('\PhpOffice\PhpSpreadsheet\IOFactory')) {
            throw new \Exception('PhpSpreadsheet library not installed. Run: composer require phpoffice/phpspreadsheet');
        }

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) {
            return [];
        }

        // Get headers
        $headers = array_map('trim', array_shift($rows));

        // Validate headers
        $requiredHeaders = ['name', 'email', 'student_id'];
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            throw new \Exception('Missing required headers: ' . implode(', ', $missingHeaders));
        }

        $students = [];
        foreach ($rows as $row) {
            if (empty(array_filter($row))) continue; // Skip empty rows

            $student = [];
            foreach ($headers as $index => $header) {
                $student[$header] = isset($row[$index]) ? trim($row[$index]) : '';
            }

            // Only add if required fields are present
            if (!empty($student['name']) && !empty($student['email']) && !empty($student['student_id'])) {
                $students[] = $student;
            }
        }

        return $students;
    }

    /**
     * Process student import (shared by file and manual import)
     */
    private function processStudentImport(array $students): JsonResponse
    {
        $imported = [];
        $failed = [];

        foreach ($students as $studentData) {
            try {
                // Check for duplicates
                $existingByEmail = User::where('email', $studentData['email'])->first();
                if ($existingByEmail) {
                    $failed[] = [
                        'name' => $studentData['name'] ?? '',
                        'email' => $studentData['email'],
                        'error' => 'Email already exists',
                    ];
                    continue;
                }

                $existingByStudentId = User::where('student_id', $studentData['student_id'])->first();
                if ($existingByStudentId) {
                    $failed[] = [
                        'name' => $studentData['name'] ?? '',
                        'email' => $studentData['email'],
                        'error' => 'Student ID already exists',
                    ];
                    continue;
                }

                // Generate password
                $defaultPassword = Str::random(8);

                // Create user
                $user = User::create([
                    'name' => $studentData['name'],
                    'email' => $studentData['email'],
                    'password' => Hash::make($defaultPassword),
                    'role' => 'student',
                    'student_id' => $studentData['student_id'],
                    'phone' => $studentData['phone'] ?? null,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);

                $imported[] = [
                    'student_id' => $user->student_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'default_password' => $defaultPassword,
                ];
            } catch (\Exception $e) {
                $failed[] = [
                    'name' => $studentData['name'] ?? '',
                    'email' => $studentData['email'] ?? 'Unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($imported) . ' students imported successfully',
            'data' => [
                'imported' => $imported,
                'failed' => $failed,
                'total' => count($students),
                'success_count' => count($imported),
                'failed_count' => count($failed),
            ],
        ]);
    }

    /**
     * Import students manually (from form)
     */
    public function importStudents(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'students' => 'required|array',
            'students.*.name' => 'required|string',
            'students.*.email' => 'required|email',
            'students.*.student_id' => 'required|string',
            'students.*.phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return $this->processStudentImport($request->students);
    }

    /**
     * Import supervisors from CSV/Excel file
     */
    public function importSupervisorsFromFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        try {
            $supervisors = [];

            if ($extension === 'csv') {
                $supervisors = $this->parseCSVForSupervisors($file);
            } else {
                $supervisors = $this->parseExcelForSupervisors($file);
            }

            if (empty($supervisors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid supervisor data found in file',
                ], 400);
            }

            return $this->processSupervisorImport($supervisors);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing file: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse CSV for supervisors
     */
    private function parseCSVForSupervisors($file): array
    {
        $supervisors = [];
        $handle = fopen($file->getRealPath(), 'r');

        $headers = fgetcsv($handle);
        $headers = array_map('trim', $headers);

        $requiredHeaders = ['name', 'email', 'staff_id'];
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            fclose($handle);
            throw new \Exception('Missing required headers: ' . implode(', ', $missingHeaders));
        }

        while (($row = fgetcsv($handle)) !== false) {
            if (empty(array_filter($row))) continue;

            $supervisor = [];
            foreach ($headers as $index => $header) {
                $supervisor[$header] = isset($row[$index]) ? trim($row[$index]) : '';
            }

            if (!empty($supervisor['name']) && !empty($supervisor['email']) && !empty($supervisor['staff_id'])) {
                $supervisors[] = $supervisor;
            }
        }

        fclose($handle);
        return $supervisors;
    }

    /**
     * Parse Excel for supervisors
     */
    private function parseExcelForSupervisors($file): array
    {
        if (!class_exists('\PhpOffice\PhpSpreadsheet\IOFactory')) {
            throw new \Exception('PhpSpreadsheet library not installed');
        }

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) return [];

        $headers = array_map('trim', array_shift($rows));

        $requiredHeaders = ['name', 'email', 'staff_id'];
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            throw new \Exception('Missing required headers: ' . implode(', ', $missingHeaders));
        }

        $supervisors = [];
        foreach ($rows as $row) {
            if (empty(array_filter($row))) continue;

            $supervisor = [];
            foreach ($headers as $index => $header) {
                $supervisor[$header] = isset($row[$index]) ? trim($row[$index]) : '';
            }

            if (!empty($supervisor['name']) && !empty($supervisor['email']) && !empty($supervisor['staff_id'])) {
                $supervisors[] = $supervisor;
            }
        }

        return $supervisors;
    }

    /**
     * Process supervisor import
     */
    private function processSupervisorImport(array $supervisors): JsonResponse
    {
        $imported = [];
        $failed = [];

        foreach ($supervisors as $supervisorData) {
            try {
                $existingByEmail = User::where('email', $supervisorData['email'])->first();
                if ($existingByEmail) {
                    $failed[] = [
                        'name' => $supervisorData['name'] ?? '',
                        'email' => $supervisorData['email'],
                        'error' => 'Email already exists',
                    ];
                    continue;
                }

                $existingByStaffId = User::where('staff_id', $supervisorData['staff_id'])->first();
                if ($existingByStaffId) {
                    $failed[] = [
                        'name' => $supervisorData['name'] ?? '',
                        'email' => $supervisorData['email'],
                        'error' => 'Staff ID already exists',
                    ];
                    continue;
                }

                $defaultPassword = Str::random(8);

                $user = User::create([
                    'name' => $supervisorData['name'],
                    'email' => $supervisorData['email'],
                    'password' => Hash::make($defaultPassword),
                    'role' => 'supervisor',
                    'staff_id' => $supervisorData['staff_id'],
                    'phone' => $supervisorData['phone'] ?? null,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);

                $imported[] = [
                    'staff_id' => $user->staff_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'default_password' => $defaultPassword,
                ];
            } catch (\Exception $e) {
                $failed[] = [
                    'name' => $supervisorData['name'] ?? '',
                    'email' => $supervisorData['email'] ?? 'Unknown',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($imported) . ' supervisors imported successfully',
            'data' => [
                'imported' => $imported,
                'failed' => $failed,
                'total' => count($supervisors),
                'success_count' => count($imported),
                'failed_count' => count($failed),
            ],
        ]);
    }

    /**
     * Import supervisors manually
     */
    public function importSupervisors(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'supervisors' => 'required|array',
            'supervisors.*.name' => 'required|string',
            'supervisors.*.email' => 'required|email',
            'supervisors.*.staff_id' => 'required|string',
            'supervisors.*.phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        return $this->processSupervisorImport($request->supervisors);
    }

    /**
     * Get all users by role with pagination and search (for admin)
     */
    public function getUsersByRole(Request $request, string $role): JsonResponse
    {
        if (!in_array($role, ['admin', 'supervisor', 'student'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid role',
            ], 400);
        }

        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');

        $query = User::where('role', $role)
            ->select('id', 'name', 'email', 'student_id', 'staff_id', 'phone', 'is_active', 'created_at')
            ->orderBy('name');

        // Apply search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%")
                    ->orWhere('staff_id', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'last_page' => $users->lastPage(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ]
            ]
        ]);
    }

    /**
     * Toggle user active status
     */
    public function toggleUserStatus(Request $request, int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => [
                'is_active' => $user->is_active,
            ],
        ]);
    }
}
