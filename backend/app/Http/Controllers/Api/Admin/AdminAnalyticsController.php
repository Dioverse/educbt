<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Exam;
use App\Models\Question;
use App\Models\ExamAttempt;
use App\Models\Subject;
use App\Models\GradeLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminAnalyticsController extends Controller
{
    /**
     * Get dashboard analytics
     */
    public function getDashboardAnalytics()
    {
        try {
            // Total counts
            $totalUsers = User::count();
            $totalStudents = User::where('role', 'student')->count();
            $totalSupervisors = User::whereIn('role', ['supervisor', 'grader'])->count();
            $totalAdmins = User::where('role', 'admin')->count();

            // Exam statistics
            $totalExams = Exam::count();
            $activeExams = Exam::where('status', 'active')->count();
            $scheduledExams = Exam::where('is_scheduled', true)
                ->where('start_datetime', '>', now())
                ->count();
            $draftExams = Exam::where('status', 'draft')->count();

            // Question statistics
            $totalQuestions = Question::count();
            $questionsByType = Question::select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type');

            // Attempt statistics
            $totalAttempts = ExamAttempt::count();
            $completedAttempts = ExamAttempt::where('status', 'submitted')->count();
            $inProgressAttempts = ExamAttempt::where('status', 'in_progress')->count();
            $todayAttempts = ExamAttempt::whereDate('created_at', today())->count();

            // Recent activity (last 7 days)
            $recentActivity = $this->getRecentActivityPaginated();

            // Popular subjects
            $popularSubjects = Subject::withCount('exams')
                ->orderBy('exams_count', 'desc')
                ->limit(5)
                ->get(['id', 'name', 'code', 'exams_count']);

            // Exam submission trends (last 30 days)
            $submissionTrends = ExamAttempt::where('status', 'submitted')
                ->where('created_at', '>=', now()->subDays(30))
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('count(*) as count')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Top performing students
            $topStudents = DB::table('exam_results')
                ->join('users', 'exam_results.user_id', '=', 'users.id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    DB::raw('AVG(exam_results.percentage) as avg_percentage'),
                    DB::raw('COUNT(exam_results.id) as total_exams')
                )
                ->where('exam_results.pass_status', 'pass')
                ->groupBy('users.id', 'users.name', 'users.email')
                ->orderBy('avg_percentage', 'desc')
                ->limit(5)
                ->get();

            // Grade level distribution
            $gradeLevelStats = GradeLevel::withCount(['students', 'exams'])
                ->get(['id', 'name', 'students_count', 'exams_count']);

            // System health metrics
            $systemHealth = [
                'flagged_attempts' => ExamAttempt::where('is_flagged', true)->count(),
                'terminated_attempts' => ExamAttempt::where('is_terminated', true)->count(),
                'high_violation_attempts' => ExamAttempt::where('tab_switch_count', '>', 5)
                    ->orWhere('copy_paste_count', '>', 3)
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => [
                        'total_users' => $totalUsers,
                        'total_students' => $totalStudents,
                        'total_supervisors' => $totalSupervisors,
                        'total_admins' => $totalAdmins,
                        'total_exams' => $totalExams,
                        'active_exams' => $activeExams,
                        'scheduled_exams' => $scheduledExams,
                        'draft_exams' => $draftExams,
                        'total_questions' => $totalQuestions,
                        'total_attempts' => $totalAttempts,
                        'completed_attempts' => $completedAttempts,
                        'in_progress_attempts' => $inProgressAttempts,
                        'today_attempts' => $todayAttempts,
                    ],
                    'questions_by_type' => $questionsByType,
                    'recent_activity' => $recentActivity,
                    'popular_subjects' => $popularSubjects,
                    'submission_trends' => $submissionTrends,
                    'top_students' => $topStudents,
                    'grade_level_stats' => $gradeLevelStats,
                    'system_health' => $systemHealth,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activity with pagination and filters
     */
    public function getRecentActivity(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 15);
            $search = $request->input('search', '');
            $type = $request->input('type', 'all');
            $days = $request->input('days', 7);

            $activities = collect();

            // Get exam attempts
            if ($type === 'all' || $type === 'exam_attempt') {
                $attempts = ExamAttempt::with(['user', 'exam'])
                    ->where('created_at', '>=', now()->subDays($days))
                    ->when($search, function($query) use ($search) {
                        $query->whereHas('user', function($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('exam', function($q) use ($search) {
                            $q->where('title', 'like', "%{$search}%");
                        });
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($attempts as $attempt) {
                    $activities->push([
                        'id' => 'attempt_' . $attempt->id,
                        'type' => 'exam_attempt',
                        'title' => $attempt->user->name . ' started exam',
                        'description' => $attempt->exam->title,
                        'user_name' => $attempt->user->name,
                        'user_email' => $attempt->user->email,
                        'timestamp' => $attempt->created_at,
                        'status' => $attempt->status,
                    ]);
                }
            }

            // Get user registrations
            if ($type === 'all' || $type === 'user_registration') {
                $users = User::where('created_at', '>=', now()->subDays($days))
                    ->when($search, function($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($users as $user) {
                    $activities->push([
                        'id' => 'user_' . $user->id,
                        'type' => 'user_registration',
                        'title' => 'New ' . $user->role . ' registered',
                        'description' => $user->name . ' (' . $user->email . ')',
                        'user_name' => $user->name,
                        'user_email' => $user->email,
                        'timestamp' => $user->created_at,
                        'status' => 'completed',
                    ]);
                }
            }

            // Get exam creations
            if ($type === 'all' || $type === 'exam_created') {
                $exams = Exam::with('creator')
                    ->where('created_at', '>=', now()->subDays($days))
                    ->when($search, function($query) use ($search) {
                        $query->where('title', 'like', "%{$search}%")
                              ->orWhereHas('creator', function($q) use ($search) {
                                  $q->where('name', 'like', "%{$search}%");
                              });
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($exams as $exam) {
                    $activities->push([
                        'id' => 'exam_' . $exam->id,
                        'type' => 'exam_created',
                        'title' => 'New exam created',
                        'description' => $exam->title . ' by ' . ($exam->creator->name ?? 'Unknown'),
                        'user_name' => $exam->creator->name ?? 'Unknown',
                        'user_email' => $exam->creator->email ?? '',
                        'timestamp' => $exam->created_at,
                        'status' => $exam->status,
                    ]);
                }
            }

            // Sort by timestamp
            $activities = $activities->sortByDesc('timestamp')->values();

            // Manual pagination
            $total = $activities->count();
            $page = $request->input('page', 1);
            $offset = ($page - 1) * $perPage;
            $paginatedActivities = $activities->slice($offset, $perPage)->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'activities' => $paginatedActivities,
                    'pagination' => [
                        'current_page' => (int) $page,
                        'per_page' => (int) $perPage,
                        'total' => $total,
                        'last_page' => ceil($total / $perPage),
                        'from' => $offset + 1,
                        'to' => min($offset + $perPage, $total),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activity for dashboard (non-paginated summary)
     */
    private function getRecentActivityPaginated()
    {
        $activities = [];

        // Recent exam attempts
        $recentAttempts = ExamAttempt::with(['user', 'exam'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        foreach ($recentAttempts as $attempt) {
            $activities[] = [
                'type' => 'exam_attempt',
                'title' => $attempt->user->name . ' started exam',
                'description' => $attempt->exam->title,
                'timestamp' => $attempt->created_at,
                'status' => $attempt->status,
            ];
        }

        // Recent user registrations
        $recentUsers = User::where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_registration',
                'title' => 'New ' . $user->role . ' registered',
                'description' => $user->name . ' (' . $user->email . ')',
                'timestamp' => $user->created_at,
                'status' => 'completed',
            ];
        }

        // Recent exam creations
        $recentExams = Exam::with('creator')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentExams as $exam) {
            $activities[] = [
                'type' => 'exam_created',
                'title' => 'New exam created',
                'description' => $exam->title . ' by ' . ($exam->creator->name ?? 'Unknown'),
                'timestamp' => $exam->created_at,
                'status' => $exam->status,
            ];
        }

        // Sort by timestamp
        usort($activities, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return array_slice($activities, 0, 15);
    }

    /**
     * Get user growth statistics
     */
    public function getUserGrowth(Request $request)
    {
        $days = $request->input('days', 30);

        $growth = User::where('created_at', '>=', now()->subDays($days))
            ->select(
                DB::raw('DATE(created_at) as date'),
                'role',
                DB::raw('count(*) as count')
            )
            ->groupBy('date', 'role')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $growth
        ]);
    }

    /**
     * Get exam performance statistics
     */
    public function getExamPerformance(Request $request)
    {
        $examId = $request->input('exam_id');

        $query = DB::table('exam_results')
            ->join('exams', 'exam_results.exam_id', '=', 'exams.id')
            ->select(
                'exams.id',
                'exams.title',
                DB::raw('AVG(exam_results.percentage) as avg_percentage'),
                DB::raw('COUNT(exam_results.id) as total_attempts'),
                DB::raw('SUM(CASE WHEN exam_results.pass_status = "pass" THEN 1 ELSE 0 END) as passed'),
                DB::raw('SUM(CASE WHEN exam_results.pass_status = "fail" THEN 1 ELSE 0 END) as failed')
            )
            ->groupBy('exams.id', 'exams.title');

        if ($examId) {
            $query->where('exams.id', $examId);
        }

        $performance = $query->get();

        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }
}
