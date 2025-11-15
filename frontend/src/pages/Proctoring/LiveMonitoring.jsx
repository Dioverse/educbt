import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Users,
  Eye,
  Wifi,
  WifiOff,
  Monitor,
  AlertTriangle,
  Flag,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import liveProctoringService from '../../services/liveProctoringService';

export default function LiveMonitoring() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch live sessions with auto-refresh
  const { data: sessionsData, refetch, isLoading } = useQuery({
    queryKey: ['live-sessions', examId],
    queryFn: () => liveProctoringService.getLiveSessions(examId),
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
  });

  console.log('Sessions Data:', sessionsData);

  // FIXED: Handle the actual API response structure
  const sessions = sessionsData?.data || [];
  const exam = sessions[0] ? { title: sessions[0].exam_title } : null;

  // Calculate statistics from the sessions array
  const stats = {
    total_active: sessions.length,
    online_count: sessions.filter(s => s.is_online !== false).length, // Assuming online by default if not specified
    total_violations: sessions.reduce((sum, s) => sum + (s.total_events || 0), 0),
    offline_count: sessions.filter(s => s.is_online === false).length,
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getViolationColor = (count) => {
    if (count === 0) return 'text-green-600 bg-green-50';
    if (count <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatTimeRemaining = (startedAt, durationMinutes) => {
    if (!startedAt || !durationMinutes) return 'N/A';
    
    const startTime = new Date(startedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = startTime + durationMs;
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeSinceStart = (startedAt) => {
    if (!startedAt) return 'N/A';
    
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/grading/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Proctoring</h1>
            <p className="text-gray-600 mt-1">
              {exam?.title || 'Exam Monitoring'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
              Auto-refresh (5s)
            </label>
          </div>
          
          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Activity size={20} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Wifi className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.online_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">With Violations</p>
              <p className="text-3xl font-bold text-gray-900">
                {sessions.filter(s => (s.total_events || 0) > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {sessions.reduce((sum, s) => sum + (s.critical_events || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sessions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Exam Sessions ({sessions.length})
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No active sessions</p>
            <p className="text-gray-500 text-sm mt-2">
              Sessions will appear here when students start taking the exam
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => {
                  const hasHighSeverity = (session.high_severity_events || 0) > 0;
                  const hasCritical = (session.critical_events || 0) > 0;
                  
                  return (
                    <tr 
                      key={session.attempt_id}
                      className={`hover:bg-gray-50 ${
                        hasCritical ? 'bg-red-50' : hasHighSeverity ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {session.student_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.student_email}
                          </div>
                          {session.selfie_path && (
                            <div className="text-xs text-green-600 mt-1">
                              ✓ Selfie verified
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {session.attempt_code}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {session.attempt_id}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-600" />
                          <span className="text-sm text-gray-900">
                            {getTimeSinceStart(session.started_at)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatTimeRemaining(session.started_at, session.duration_minutes)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Duration: {session.duration_minutes} min
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getViolationColor(session.total_events || 0)}`}>
                          {session.total_events || 0} {(session.total_events || 0) === 1 ? 'event' : 'events'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {session.critical_events > 0 && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle size={14} />
                              <span>{session.critical_events} Critical</span>
                            </div>
                          )}
                          {session.high_severity_events > 0 && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <AlertTriangle size={14} />
                              <span>{session.high_severity_events} High</span>
                            </div>
                          )}
                          {session.total_events === 0 && (
                            <div className="text-xs text-green-600">
                              ✓ Clean
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/proctoring/session/${session.attempt_id}`)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for flagging:');
                              if (reason) {
                                liveProctoringService.flagStudent(session.attempt_id, reason)
                                  .then(() => {
                                    alert('Student flagged successfully');
                                    refetch();
                                  })
                                  .catch(err => {
                                    alert(err.response?.data?.message || 'Failed to flag student');
                                  });
                              }
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Flag Student"
                          >
                            <Flag size={18} />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to terminate this exam? This action cannot be undone.')) {
                                const reason = prompt('Enter termination reason:');
                                if (reason) {
                                  liveProctoringService.terminateExam(session.attempt_id, reason)
                                    .then(() => {
                                      alert('Exam terminated');
                                      refetch();
                                    })
                                    .catch(err => {
                                      alert(err.response?.data?.message || 'Failed to terminate exam');
                                    });
                                }
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Terminate Exam"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Events Summary */}
      {sessions.some(s => s.recent_events?.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Events
          </h3>
          <div className="space-y-3">
            {sessions.map(session => 
              session.recent_events?.map((event, idx) => (
                <div 
                  key={`${session.attempt_id}-${idx}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle 
                      size={20} 
                      className={
                        event.severity === 'critical' ? 'text-red-600' :
                        event.severity === 'high' ? 'text-yellow-600' :
                        'text-blue-600'
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.student_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {event.type} - {event.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}