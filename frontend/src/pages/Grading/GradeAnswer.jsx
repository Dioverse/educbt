import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Award, User, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import gradingService from '../../services/gradingService';
import rubricService from '../../services/rubricService';

export default function GradeAnswer() {
  const { answerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [marksAwarded, setMarksAwarded] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedRubric, setSelectedRubric] = useState('');
  const [criteriaScores, setCriteriaScores] = useState({});
  const [notification, setNotification] = useState(null);

  // Simple notification system (replaces toast)
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch answer details
  const { data: answerData, isLoading } = useQuery({
    queryKey: ['answer-to-grade', answerId],
    queryFn: async () => {
      const response = await gradingService.getPendingGrading();
      return response.data.find(a => a.id === parseInt(answerId));
    },
  });

  // Fetch rubrics
  const { data: rubricsData } = useQuery({
    queryKey: ['rubrics'],
    queryFn: () => rubricService.getRubrics(),
  });

  // Grade mutation
  const gradeMutation = useMutation({
    mutationFn: (data) => gradingService.gradeAnswer(answerId, data),
    onSuccess: () => {
      showNotification('Answer graded successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['pending-grading'] });
      queryClient.invalidateQueries({ queryKey: ['grading-statistics'] });
      setTimeout(() => navigate('/grading/dashboard'), 1000);
    },
    onError: (error) => {
      showNotification(error.response?.data?.message || 'Failed to grade answer', 'error');
    },
  });

  const answer = answerData;
  const rubrics = rubricsData?.data || [];

  const handleGrade = (status = 'final') => {
    if (!marksAwarded || marksAwarded === '') {
      showNotification('Please enter marks awarded', 'error');
      return;
    }

    const marksValue = parseFloat(marksAwarded);
    const maxMarks = answer?.exam_question?.marks || 0;

    if (isNaN(marksValue)) {
      showNotification('Please enter a valid number', 'error');
      return;
    }

    if (marksValue > maxMarks) {
      showNotification(`Marks cannot exceed ${maxMarks}`, 'error');
      return;
    }

    if (marksValue < 0) {
      showNotification('Marks cannot be negative', 'error');
      return;
    }

    gradeMutation.mutate({
      marks_awarded: marksValue,
      feedback,
      rubric_id: selectedRubric || null,
      criteria_scores: Object.keys(criteriaScores).length > 0 ? criteriaScores : null,
      grade_status: status,
    });
  };

  if (isLoading || !answer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading answer...</p>
        </div>
      </div>
    );
  }

  const maxMarks = answer.exam_question?.marks || 0;
  const selectedRubricData = rubrics.find(r => r.id === parseInt(selectedRubric));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Notification (Toast Replacement) */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <XCircle size={20} />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/grading/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Answer</h1>
          <p className="text-gray-600 mt-1">Review and assign marks to student submission</p>
        </div>
      </div>

      {/* Student & Exam Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <User size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Student</p>
              <p className="font-semibold text-gray-900">
                {answer.exam_attempt?.user?.name || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Exam</p>
              <p className="font-semibold text-gray-900">
                {answer.exam_attempt?.exam?.title || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="font-semibold text-gray-900">
                {new Date(answer.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Question</h3>
        {answer.question?.question_text ? (
          <div 
            className="prose max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: answer.question.question_text }}
          />
        ) : (
          <p className="text-gray-500 mb-4">No question text available</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Award size={16} />
            <strong>Max Marks:</strong> {maxMarks}
          </span>
          <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded">
            {answer.question?.type?.replace(/_/g, ' ') || 'N/A'}
          </span>
        </div>
      </div>

      {/* Student Answer */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Student&apos;s Answer</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          {answer.text_answer || answer.answer_text ? (
            <p className="whitespace-pre-wrap text-gray-800">
              {answer.text_answer || answer.answer_text}
            </p>
          ) : answer.uploaded_file_path || answer.file_path ? (
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {answer.uploaded_file_name || 'Uploaded File'}
                </p>
                <a
                  href={answer.uploaded_file_path || answer.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  View/Download File
                </a>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No answer provided</p>
          )}
        </div>

        {answer.time_spent_seconds && (
          <p className="text-sm text-gray-600 mt-2">
            Time spent: {Math.floor(answer.time_spent_seconds / 60)} minutes
          </p>
        )}
      </div>

      {/* Grading Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Grading</h3>

        {/* Rubric Selection */}
        {rubrics.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Use Grading Rubric (Optional)
            </label>
            <select
              value={selectedRubric}
              onChange={(e) => setSelectedRubric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No Rubric - Manual Grading</option>
              {rubrics.map((rubric) => (
                <option key={rubric.id} value={rubric.id}>
                  {rubric.name} (Max: {rubric.max_score})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rubric Criteria */}
        {selectedRubricData && selectedRubricData.criteria && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h4 className="font-medium text-primary-900 mb-3">Grading Criteria</h4>
            <div className="space-y-3">
              {selectedRubricData.criteria.map((criterion) => (
                <div key={criterion.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{criterion.criterion_name}</p>
                    <p className="text-sm text-gray-600">{criterion.description}</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={criterion.max_points}
                      placeholder={`/ ${criterion.max_points}`}
                      value={criteriaScores[criterion.id] || ''}
                      onChange={(e) => setCriteriaScores({
                        ...criteriaScores,
                        [criterion.id]: parseFloat(e.target.value) || ''
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marks Awarded */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marks Awarded <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="0"
              max={maxMarks}
              value={marksAwarded}
              onChange={(e) => setMarksAwarded(e.target.value)}
              placeholder="Enter marks"
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="text-lg text-gray-600">/ {maxMarks}</span>
          </div>
          {marksAwarded && !isNaN(parseFloat(marksAwarded)) && (
            <p className="mt-2 text-sm text-gray-600">
              Percentage: {((parseFloat(marksAwarded) / maxMarks) * 100).toFixed(1)}%
            </p>
          )}
          {marksAwarded && parseFloat(marksAwarded) > maxMarks && (
            <p className="mt-1 text-sm text-red-600">
              Marks cannot exceed {maxMarks}
            </p>
          )}
        </div>

        {/* Feedback */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback to Student
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={6}
            placeholder="Provide constructive feedback..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/grading/dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={() => handleGrade('draft')}
            disabled={!marksAwarded || gradeMutation.isPending}
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            onClick={() => handleGrade('final')}
            disabled={!marksAwarded || gradeMutation.isPending}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {gradeMutation.isPending ? 'Submitting...' : 'Submit Grade'}
          </button>
        </div>
      </div>

      {/* Add animation CSS */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}