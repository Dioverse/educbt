import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Upload,
  TrendingUp,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  Activity,
  Calendar,
  BarChart3,
} from 'lucide-react';
import adminAnalyticsService from '../../services/adminAnalyticsService';
import RecentActivityPanel from '../../components/Admin/RecentActivityPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminAnalyticsService.getDashboardAnalytics,
    refetchInterval: 60000, // Refresh every minute
  });

  const analytics = analyticsData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam_attempt':
        return <FileText size={16} className="text-blue-600" />;
      case 'user_registration':
        return <Users size={16} className="text-green-600" />;
      case 'exam_created':
        return <BookOpen size={16} className="text-purple-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-700',
      submitted: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, exams, and system settings
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Activity size={20} />
          Refresh
        </button>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <Users className="text-teal-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.total_users || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.total_students || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Supervisors</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.total_supervisors || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.total_admins || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Exams</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Exams</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.active_exams || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.scheduled_exams || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.total_questions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="text-gray-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.draft_exams || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.total_attempts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.completed_attempts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.in_progress_attempts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics?.overview?.today_attempts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Subjects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Subjects</h2>
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          {analytics?.popular_subjects?.length > 0 ? (
            <div className="space-y-3">
              {analytics.popular_subjects.map((subject, index) => (
                <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{subject.name}</p>
                      <p className="text-xs text-gray-500">{subject.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{subject.exams_count}</p>
                    <p className="text-xs text-gray-500">exams</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No subjects yet</p>
          )}
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            <AlertTriangle size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Flagged Attempts</p>
                  <p className="text-sm text-gray-600">Requires review</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {analytics?.system_health?.flagged_attempts || 0}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Terminated</p>
                  <p className="text-sm text-gray-600">Due to violations</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {analytics?.system_health?.terminated_attempts || 0}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-orange-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">High Violations</p>
                  <p className="text-sm text-gray-600">Suspicious activity</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-700">
                {analytics?.system_health?.high_violation_attempts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Students */}
      {analytics?.top_students?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Students</h2>
            <Award size={20} className="text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.top_students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-teal ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-green-600">
                          {parseFloat(student.avg_percentage).toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {student.total_exams} exams
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/users/import-students')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
          >
            <Upload className="mx-auto text-gray-600 mb-2" size={32} />
            <p className="font-medium text-gray-900">Import Students</p>
            <p className="text-sm text-gray-600 mt-1">Upload student data</p>
          </button>

          <button
            onClick={() => navigate('/admin/users/import-supervisors')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <Upload className="mx-auto text-gray-600 mb-2" size={32} />
            <p className="font-medium text-gray-900">Import Supervisors</p>
            <p className="text-sm text-gray-600 mt-1">Upload staff data</p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Users className="mx-auto text-gray-600 mb-2" size={32} />
            <p className="font-medium text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-600 mt-1">View all users</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivityPanel />
      {/* <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {analytics?.recent_activity?.length > 0 ? (
          <div className="space-y-3">
            {analytics.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)}`}>
                    {activity.status}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div> */}
    </div>
  );
}