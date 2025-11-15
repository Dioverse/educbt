import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MinusCircle,
  User,
  Clock,
  Award,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react';
import resultService from '../../services/resultService';

export default function AttemptDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: resultData, isLoading, error } = useQuery({
    queryKey: ['attempt-result', attemptId],
    queryFn: () => resultService.getAttemptResult(attemptId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attempt details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Details</h2>
          <p className="text-gray-600 mb-6">
            {error.response?.data?.message || 'Failed to load attempt details'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const result = resultData?.data?.result;
  const exam = resultData?.data?.exam;
  const attempt = resultData?.data?.attempt;
  const answers = resultData?.data?.answers || [];

  if (!result || !exam || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto text-yellow-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">Unable to load attempt details</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (isCorrect, isAnswered) => {
    if (!isAnswered) {
      return <MinusCircle className="text-gray-400" size={24} />;
    }
    return isCorrect ? (
      <CheckCircle className="text-green-600" size={24} />
    ) : (
      <XCircle className="text-red-600" size={24} />
    );
  };

  const getStatusBadge = (isCorrect, isAnswered) => {
    if (!isAnswered) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Not Answered</span>;
    }
    return isCorrect ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Correct</span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Incorrect</span>
    );
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attempt Details</h1>
            <p className="text-gray-600 mt-1">View detailed submission and answers</p>
          </div>
        </div>

        {/* Student & Exam Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <User size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-semibold text-gray-900">
                  {attempt.user?.name || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Exam</p>
                <p className="font-semibold text-gray-900">
                  {exam.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="font-semibold text-gray-900">
                  {parseFloat(result.marks_obtained || 0).toFixed(2)} / {parseFloat(result.total_marks || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={20} className="text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(result.time_taken_seconds || attempt.time_spent_seconds)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-lg font-bold text-gray-900">
                {parseFloat(result.percentage || 0).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grade</p>
              <p className="text-lg font-bold text-gray-900">
                {result.grade || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                result.pass_status === 'pass'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {result.pass_status === 'pass' ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>

        {/* Questions & Answers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Questions & Answers ({answers.length})
          </h2>

          <div className="space-y-6">
            {answers.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No answers found for this attempt</p>
              </div>
            ) : (
              answers.map((answer) => {
                const isAnswered = answer.selected_option_id || answer.text_answer || answer.uploaded_file_path;
                const isCorrect = answer.is_correct === true || answer.is_correct === 1;

                return (
                  <div key={answer.id} className="border border-gray-200 rounded-lg p-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {answer.exam_question?.display_order && (
                          <span className="flex-shrink-0 w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold">
                            Q{answer.exam_question.display_order}
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-600">
                              {answer.question?.type?.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              • {answer.exam_question?.marks || answer.question?.marks || 0} marks
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(isCorrect, isAnswered)}
                        {getStatusBadge(isCorrect, isAnswered)}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <div
                        className="prose max-w-none text-gray-900"
                        dangerouslySetInnerHTML={{ __html: answer.question?.question_text || 'Question text not available' }}
                      />
                    </div>

                    {/* Answer Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Student's Answer:</h4>

                      {/* MCQ Answer */}
                      {(answer.question?.type === 'multiple_choice_single' || answer.question?.type === 'multiple_choice_multiple') && answer.question?.options && (
                        <div className="space-y-2">
                          {answer.question.options.map((option) => {
                            const isSelected = answer.selected_option_id === option.id ||
                              (Array.isArray(answer.selected_option_ids) && answer.selected_option_ids.includes(option.id));
                            const isCorrectOption = option.is_correct;

                            return (
                              <div
                                key={option.id}
                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                  isSelected && isCorrectOption
                                    ? 'bg-green-100 border border-green-300'
                                    : isSelected && !isCorrectOption
                                    ? 'bg-red-100 border border-red-300'
                                    : isCorrectOption
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className={`flex-1 ${
                                  isSelected ? 'font-medium' : ''
                                }`}>
                                  {option.option_key}. {option.option_text}
                                </span>
                                {isCorrectOption && (
                                  <CheckCircle className="text-green-600" size={18} />
                                )}
                                {isSelected && !isCorrectOption && (
                                  <XCircle className="text-red-600" size={18} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Text Answer */}
                      {answer.question?.type === 'essay' && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          {answer.text_answer ? (
                            <p className="whitespace-pre-wrap text-gray-800">{answer.text_answer}</p>
                          ) : (
                            <p className="text-gray-500 italic">No answer provided</p>
                          )}
                        </div>
                      )}

                      {/* File Upload Answer */}
                      {answer.question?.type === 'file_upload' && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          {answer.uploaded_file_path ? (
                            <div className="flex items-center gap-3">
                              <FileText size={24} className="text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {answer.uploaded_file_name || 'Uploaded File'}
                                </p>
                                <a
                                  href={answer.uploaded_file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-teal-600 hover:underline"
                                >
                                  View/Download File
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No file uploaded</p>
                          )}
                        </div>
                      )}

                      {/* Short Answer */}
                      {(answer.question?.type === 'short_answer' || answer.question?.type === 'true_false') && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          {answer.text_answer ? (
                            <p className="text-gray-800">{answer.text_answer}</p>
                          ) : (
                            <p className="text-gray-500 italic">No answer provided</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Marks Obtained */}
                    {answer.marks_obtained !== null && answer.marks_obtained !== undefined && (
                      <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-700">Marks Obtained:</span>
                        <span className="text-lg font-bold text-blue-700">
                          {parseFloat(answer.marks_obtained).toFixed(2)} / {answer.exam_question?.marks || answer.question?.marks || 0}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
