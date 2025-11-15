import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar,
  Clock,
  BookOpen,
  Award,
  Play,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import studentExamService from '../../services/studentExamService';
import useStudentExamStore from '../../store/studentExamStore';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { setAvailableExams, setMyAttempts } = useStudentExamStore();

  // Fetch available exams
  const { data: availableExamsData, isLoading: loadingExams } = useQuery({
    queryKey: ['available-exams'],
    queryFn: studentExamService.getAvailableExams,
  });

  // Fetch my attempts
  const { data: attemptsData, isLoading: loadingAttempts } = useQuery({
    queryKey: ['my-attempts'],
    queryFn: () => studentExamService.getMyAttempts(),
  });

  useEffect(() => {
    if (availableExamsData?.data) {
      setAvailableExams(availableExamsData.data);
    }
  }, [availableExamsData]);

  useEffect(() => {
    if (attemptsData?.data) {
      setMyAttempts(attemptsData.data);
    }
  }, [attemptsData]);

  useEffect(() => {
  console.log('Available Exams Data:', availableExamsData);
  console.log('Attempts Data:', attemptsData);
}, [availableExamsData, attemptsData]);

  const upcomingExams = availableExamsData?.data?.filter(exam => exam.is_upcoming) || [];
  const activeExams = availableExamsData?.data?.filter(exam => exam.is_ongoing) || [];
  const recentAttempts = attemptsData?.data?.slice(0, 5) || [];

  const getStatusColor = (status) => {
    const colors = {
      in_progress: 'bg-teal-100 text-teal-800',
      submitted: 'bg-green-100 text-green-800',
      auto_submitted: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Student!</h1>
        <p className="text-teal-100">
          Ready to take your exams? Check out what's available below.
        </p>
      </div>

      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <BookOpen className="text-teal-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Exams</p>
              <p className="text-2xl font-bold text-gray-900">
                {availableExamsData?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Play className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeExams.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingExams.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {attemptsData?.data?.filter(e => e.last_attempt_status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <CheckCircle className="text-teal-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {attemptsData?.data?.filter(a => a.status === 'submitted').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
        <p className="text-gray-600 mt-1">
          Available exams and your attempts
        </p>
      </div>

      {/* Active Exams */}
      {activeExams.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Play className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Active Exams - Start Now!</h2>
          </div>
          <div className="space-y-3">
            {activeExams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-400 transition-all cursor-pointer"
                onClick={() => navigate(`/student/exam/${exam.id}/start`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exam.title}
                      </h3>
                      <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded flex items-center gap-1">
                        <Play size={12} />
                        Live Now
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {exam.duration_minutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {exam.total_questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={16} />
                        {exam.total_marks} marks
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/exam/${exam.id}/start`);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Exams */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Available Exams</h2>
        
        {loadingExams ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exams...</p>
          </div>
        ) : availableExamsData?.data?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No exams available at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableExamsData?.data?.map((exam) => (
              <div
                key={exam.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/student/exam/${exam.id}/start`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {exam.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {exam.duration_minutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {exam.total_questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={16} />
                        {exam.total_marks} marks
                      </span>
                      {exam.subject && (
                        <span>Subject: {exam.subject.name}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/exam/${exam.id}/start`);
                    }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attempts */}
      {recentAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Attempts</h2>
          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {attempt.exam?.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>Attempt #{attempt.attempt_number}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(attempt.status)}`}>
                        {attempt.status.replace('_', ' ')}
                      </span>
                      {attempt.started_at && (
                        <span>
                          {new Date(attempt.started_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {attempt.status === 'in_progress' && (
                    <button
                      onClick={() => navigate(`/student/exam/${attempt.id}/session`)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Resume
                    </button>
                  )}
                  {(attempt.status === 'submitted' || attempt.status === 'auto_submitted') && (
                    <button
                      onClick={() => navigate(`/student/exam/${attempt.id}/result`)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      View Result
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}