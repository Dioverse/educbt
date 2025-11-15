import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  Eye,
  Target,
  BarChart3,
} from 'lucide-react';
import studentExamService from '../../services/studentExamService';

export default function ExamResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // Fetch result
  const { data: resultData, isLoading, error } = useQuery({
    queryKey: ['exam-result', attemptId],
    queryFn: () => studentExamService.getResult(attemptId),
  });

  const result = resultData?.data;

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-primary-600 bg-primary-50 border-primary-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Clock className="mx-auto text-yellow-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-yellow-900 mb-2">Result Not Available</h2>
          <p className="text-yellow-700 mb-4">
            {error.response?.data?.message || 'Results have not been published yet.'}
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const passed = result.pass_status === 'pass';
  const percentage = parseFloat(result.percentage);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600 mt-1">{result.exam?.title}</p>
        </div>
      </div>

      {/* Result Summary Card */}
      <div className={`rounded-lg border-2 p-8 ${getGradeColor(percentage)}`}>
        <div className="text-center">
          {passed ? (
            <CheckCircle size={64} className="mx-auto mb-4" />
          ) : (
            <XCircle size={64} className="mx-auto mb-4" />
          )}
          
          <h2 className="text-3xl font-bold mb-2">
            {passed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
          </h2>
          <p className="text-lg mb-6">
            {passed 
              ? 'You have successfully passed the exam!' 
              : 'You did not pass this time, but keep practicing!'}
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div>
              <p className="text-sm mb-1 opacity-75">Score</p>
              <p className="text-4xl font-bold">
                {result.marks_obtained}
              </p>
              <p className="text-lg opacity-75">
                / {result.total_marks}
              </p>
            </div>
            <div>
              <p className="text-sm mb-1 opacity-75">Percentage</p>
              <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm mb-1 opacity-75">Grade</p>
              <p className="text-4xl font-bold">{result.grade || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <span className="text-sm text-gray-600">Correct</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{result.correct_answers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((result.correct_answers / (result.correct_answers + result.incorrect_answers + result.unanswered)) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={24} />
            </div>
            <span className="text-sm text-gray-600">Incorrect</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{result.incorrect_answers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((result.incorrect_answers / (result.correct_answers + result.incorrect_answers + result.unanswered)) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Target className="text-gray-600" size={24} />
            </div>
            <span className="text-sm text-gray-600">Unanswered</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{result.unanswered}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((result.unanswered / (result.correct_answers + result.incorrect_answers + result.unanswered)) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="text-primary-600" size={24} />
            </div>
            <span className="text-sm text-gray-600">Time Taken</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatTime(result.time_taken_seconds)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Avg: {result.avg_time_per_question_seconds?.toFixed(0)}s/question
          </p>
        </div>
      </div>

      {/* Pass/Fail Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target size={24} className="text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Pass Mark</h3>
              <p className="text-sm text-gray-600">
                Minimum required: {result.exam?.pass_marks || 0} marks
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Your score</p>
            <p className="text-2xl font-bold text-gray-900">
              {result.marks_obtained} marks
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {passed ? 'PASSED ✓' : 'NOT PASSED ✗'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Ranking */}
      {(result.rank || result.percentile) && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Your Performance Ranking
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {result.rank && result.total_participants && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Rank</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary-600">
                    {result.rank}
                  </span>
                  <span className="text-gray-600">
                    / {result.total_participants}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Top {((result.rank / result.total_participants) * 100).toFixed(1)}%
                </p>
              </div>
            )}
            {result.percentile && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Percentile</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-purple-600">
                    {result.percentile.toFixed(1)}
                  </span>
                  <span className="text-gray-600">%ile</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Better than {result.percentile.toFixed(1)}% of students
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section-wise Performance */}
      {result.show_score_breakdown && result.section_wise_scores && 
       Object.keys(result.section_wise_scores).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Section-wise Performance
          </h3>
          <div className="space-y-4">
            {Object.entries(result.section_wise_scores).map(([section, score]) => {
              const sectionPercentage = (score.obtained / score.total) * 100;
              return (
                <div key={section}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{section}</span>
                    <span className="text-gray-600">
                      {score.obtained} / {score.total} ({sectionPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        sectionPercentage >= 80 ? 'bg-green-600' :
                        sectionPercentage >= 60 ? 'bg-primary-600' :
                        sectionPercentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${sectionPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructor Remarks */}
      {result.remarks && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
            <Award size={20} />
            Instructor Remarks
          </h3>
          <p className="text-primary-800">{result.remarks}</p>
        </div>
      )}

      {/* Negative Marking */}
      {result.negative_marks_deducted > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-900">
            <strong>Note:</strong> {result.negative_marks_deducted} marks were deducted 
            for incorrect answers due to negative marking.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {result.exam?.allow_review_after_submit && (
          <button
            onClick={() => navigate(`/student/review/${attemptId}`)}
            className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 flex items-center justify-center gap-2 font-medium"
          >
            <Eye size={20} />
            Review Your Answers
          </button>
        )}

        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}