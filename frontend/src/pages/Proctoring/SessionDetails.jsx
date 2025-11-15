import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  User,
  Monitor,
  Camera,
  AlertTriangle,
  Clock,
  Flag,
  XCircle,
} from 'lucide-react';
import liveProctoringService from '../../services/liveProctoringService';

export default function SessionDetails() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch session details with auto-refresh
  const { data: sessionData, refetch } = useQuery({
    queryKey: ['session-details', attemptId],
    queryFn: () => liveProctoringService.getSessionDetails(attemptId),
    refetchInterval: autoRefresh ? 3000 : false, // Refresh every 3 seconds
  });

  const session = sessionData?.data;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'tab_switch':
      case 'window_blur':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'suspicious_activity':
      case 'flagged_by_supervisor':
        return <Flag className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/proctoring/live/${session.exam.id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
            <p className="text-gray-600 mt-1">
              {session.user.name} - {session.exam.title}
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
              Auto-refresh
            </label>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} />
          Student Information
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium text-gray-900">{session.user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Student ID</p>
            <p className="font-medium text-gray-900">{session.user.student_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-gray-900">{session.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              session.is_online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {session.is_online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Monitor size={20} />
          Device Information
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">IP Address</p>
            <p className="font-medium text-gray-900">{session.device_info.ip_address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Device Type</p>
            <p className="font-medium text-gray-900">{session.device_info.device_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Browser</p>
            <p className="font-medium text-gray-900">{session.device_info.browser}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Operating System</p>
            <p className="font-medium text-gray-900">{session.device_info.os}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Activity</p>
            <p className="font-medium text-gray-900">
              {new Date(session.last_activity_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">User Agent</p>
            <p className="font-medium text-gray-900 text-xs truncate" title={session.device_info.user_agent}>
              {session.device_info.user_agent}
            </p>
          </div>
        </div>
      </div>

      {/* Proctoring Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera size={20} />
          Proctoring Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Selfie Verification</p>
            {session.proctoring.selfie_captured ? (
              <div className="flex items-center gap-3">
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={session.proctoring.selfie_url} 
                    alt="Student selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-green-600 text-sm">✓ Selfie captured</span>
              </div>
            ) : (
              <span className="text-red-600 text-sm">✗ No selfie captured</span>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Current Progress</p>
            <div className="flex items-center gap-4">
              <p className="font-medium text-gray-900">
                Question {session.current_question_index + 1} of {session.exam.questions?.length || 0}
              </p>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full"
                  style={{
                    width: `${((session.current_question_index + 1) / (session.exam.questions?.length || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Proctoring Events</h3>
        
        {session.proctoring.recent_events.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No events recorded</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {session.proctoring.recent_events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.event_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {event.event_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                      {event.severity === 1 ? 'Low' : event.severity === 2 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            const reason = prompt('Enter reason for flagging:');
            if (reason) {
              liveProctoringService.flagStudent(attemptId, reason)
                .then(() => {
                  alert('Student flagged successfully');
                  refetch();
                });
            }
          }}
          className="flex-1 px-6 py-3 border-2 border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 flex items-center justify-center gap-2 font-medium"
        >
          <Flag size={20} />
          Flag Student
        </button>
        
        <button
          onClick={() => {
            if (confirm('Are you sure you want to terminate this exam? This action cannot be undone.')) {
              const reason = prompt('Enter termination reason:');
              if (reason) {
                liveProctoringService.terminateExam(attemptId, reason)
                  .then(() => {
                    alert('Exam terminated');
                    navigate(`/proctoring/live/${session.exam.id}`);
                  });
              }
            }
          }}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium"
        >
          <XCircle size={20} />
          Terminate Exam
        </button>
      </div>
    </div>
  );
}