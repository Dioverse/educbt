import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  BookOpen, 
  Award, 
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Users,
  BarChart3,
} from 'lucide-react';
import examService from '../../services/examService';

export default function ViewExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: examData, isLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExam(examId),
  });

  // Publish/Unpublish mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (status) => examService.updateExam(examId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['exam', examId]);
      queryClient.invalidateQueries(['exams']);
    },
  });

  const handlePublish = () => {
    if (confirm('Are you sure you want to publish this exam? Students will be able to see and take it.')) {
      toggleStatusMutation.mutate('active');
    }
  };

  const handleUnpublish = () => {
    if (confirm('Are you sure you want to unpublish this exam? Students will no longer be able to access it.')) {
      toggleStatusMutation.mutate('draft');
    }
  };

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this exam?')) {
      toggleStatusMutation.mutate('archived');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const exam = examData?.data;

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Exam not found</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      archived: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Archived' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/exams')}
            className="p-2 hover:bg-gray-100 rounded-lg mt-1"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              {getStatusBadge(exam.status)}
            </div>
            <p className="text-gray-600">{exam.subject?.name}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Publish/Unpublish Button */}
          {exam.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={toggleStatusMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Eye size={20} />
              {toggleStatusMutation.isPending ? 'Publishing...' : 'Publish Exam'}
            </button>
          )}

          {exam.status === 'active' && (
            <>
              <button
                onClick={handleUnpublish}
                disabled={toggleStatusMutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50"
              >
                <EyeOff size={20} />
                {toggleStatusMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
              </button>
              <button
                onClick={() => navigate(`/proctoring/live/${examId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Users size={20} />
                Live Monitor
              </button>
            </>
          )}

          {exam.status === 'archived' && (
            <button
              onClick={handlePublish}
              disabled={toggleStatusMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Eye size={20} />
              Reactivate
            </button>
          )}

          <button
            onClick={() => navigate(`/exams/${examId}/edit`)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Edit size={20} />
            Edit Exam
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {exam.status === 'draft' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <EyeOff className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-yellow-900">This exam is in draft mode</p>
              <p className="text-sm text-yellow-800 mt-1">
                Students cannot see or access this exam. Click "Publish Exam" when you're ready to make it available.
              </p>
            </div>
          </div>
        </div>
      )}

      {exam.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-green-900">This exam is published and active</p>
              <p className="text-sm text-green-800 mt-1">
                Students can now see and take this exam. You can monitor attempts in real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{exam.duration_minutes} min</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-gray-900">{exam.questions?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="text-2xl font-bold text-gray-900">{exam.total_marks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{exam.attempts_count || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Information</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Subject</p>
              <p className="font-medium text-gray-900">{exam.subject?.name || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Pass Marks</p>
              <p className="font-medium text-gray-900">{exam.pass_marks} / {exam.total_marks}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Maximum Attempts</p>
              <p className="font-medium text-gray-900">{exam.max_attempts}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Created By</p>
              <p className="font-medium text-gray-900">{exam.creator?.name || '-'}</p>
            </div>

            {exam.start_date && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(exam.start_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {exam.end_date && (
              <div>
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(exam.end_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {exam.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{exam.description}</p>
          </div>
        )}

        {exam.instructions && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{exam.instructions}</p>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Settings</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${exam.shuffle_questions ? 'bg-green-500' : 'bg-gray-300'}`}>
              {exam.shuffle_questions && <CheckCircle size={20} className="text-white" />}
            </div>
            <span className="text-gray-700">Shuffle Questions</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${exam.shuffle_options ? 'bg-green-500' : 'bg-gray-300'}`}>
              {exam.shuffle_options && <CheckCircle size={20} className="text-white" />}
            </div>
            <span className="text-gray-700">Shuffle Options</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${exam.enable_negative_marking ? 'bg-green-500' : 'bg-gray-300'}`}>
              {exam.enable_negative_marking && <CheckCircle size={20} className="text-white" />}
            </div>
            <span className="text-gray-700">Negative Marking</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${exam.require_webcam ? 'bg-green-500' : 'bg-gray-300'}`}>
              {exam.require_webcam && <CheckCircle size={20} className="text-white" />}
            </div>
            <span className="text-gray-700">Require Webcam</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${exam.disable_copy_paste ? 'bg-green-500' : 'bg-gray-300'}`}>
              {exam.disable_copy_paste && <CheckCircle size={20} className="text-white" />}
            </div>
            <span className="text-gray-700">Disable Copy/Paste</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${exam.enable_tab_switch_detection ? 'bg-green-500' : 'bg-gray-300'}`}>
              {exam.enable_tab_switch_detection && <CheckCircle size={20} className="text-white" />}
            </div>
            <span className="text-gray-700">Tab Switch Detection</span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Questions ({exam.questions?.length || 0})
        </h2>

        {!exam.questions || exam.questions.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No questions added yet</p>
        ) : (
          <div className="space-y-4">
            {exam.questions.map((question, index) => (
              <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div className="font-medium text-gray-900">
                        {question.question_text}
                      </div>
                    </div>
                    <div className="ml-11 flex items-center gap-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {question.type}
                      </span>
                      <span>Marks: {question.marks}</span>
                      {question.negative_marks > 0 && (
                        <span className="text-red-600">Negative: -{question.negative_marks}</span>
                      )}
                      <span>Difficulty: {question.difficulty_level}</span>
                    </div>
                  </div>
                </div>

                {/* Show options for MCQ */}
                {(question.type === 'multiple_choice_single' || question.type === 'multiple_choice_multiple') && question.options && (
                  <div className="mt-3 ml-11 space-y-2">
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          option.is_correct ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`} />
                        <span className={option.is_correct ? 'font-medium text-green-700' : 'text-gray-700'}>
                          {option.option_key}. {option.option_text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {exam.status !== 'archived' && (
          <button
            onClick={handleArchive}
            disabled={toggleStatusMutation.isPending}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Archive Exam
          </button>
        )}
        
        {exam.status === 'active' && (
          <button
            onClick={() => navigate(`/results/${examId}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <BarChart3 size={20} />
            View Results
          </button>
        )}
      </div>
    </div>
  );
}