import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock,
  TrendingUp,
  Home,
  AlertCircle,
  FileText,
} from 'lucide-react';
import studentExamService from '../../services/studentExamService';

export default function ExamResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: resultData, isLoading, error } = useQuery({
    queryKey: ['exam-result', attemptId],
    queryFn: () => studentExamService.getResult(attemptId),
    retry: 1,
  });

  console.log('Result Data:', resultData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Handle error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Result</h2>
          <p className="text-gray-600 mb-6">
            {error.response?.data?.message || 'Failed to load exam result'}
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const result = resultData?.data?.result;
  const exam = resultData?.data?.exam;
  const attempt = resultData?.data?.attempt;

  console.log('Result:', result);
  console.log('Exam:', exam);
  console.log('Attempt:', attempt);

  // Handle no result
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="mx-auto text-yellow-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Not Available</h2>
          <p className="text-gray-600 mb-6">
            Your result is being processed. Please check back later.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // FIXED: Proper number parsing and calculations
  const marksObtained = parseFloat(result.marks_obtained || result.total_score || 0);
  const totalMarks = parseFloat(result.total_marks || exam?.total_marks || 0);
  const passMarks = parseFloat(result.pass_marks || exam?.pass_marks || 0);
  
  // Calculate percentage properly
  const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
  
  // Determine pass status
  const isPassed = marksObtained >= passMarks || result.pass_status === 'pass';
  
  // Get answer counts
  const correctAnswers = parseInt(result.correct_answers || 0);
  const incorrectAnswers = parseInt(result.incorrect_answers || result.wrong_answers || 0);
  const unanswered = parseInt(result.unanswered || result.skipped || 0);
  const totalQuestions = correctAnswers + incorrectAnswers + unanswered;

  // Calculate time taken
  const timeTakenSeconds = result.time_taken_seconds || 
                          result.time_spent_seconds || 
                          attempt?.time_spent_seconds || 
                          0;
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  // Determine grade
  const getGrade = (percent) => {
    if (result.grade) return result.grade;
    
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    if (percent >= 50) return 'D';
    return 'F';
  };

  const grade = getGrade(percentage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* Result Header */}
        <div className={`rounded-lg shadow-lg p-8 text-white ${
          isPassed ? 'bg-gradient-to-r from-green-600 to-green-800' : 'bg-gradient-to-r from-red-600 to-red-800'
        }`}>
          <div className="text-center">
            {isPassed ? (
              <CheckCircle className="mx-auto mb-4" size={64} />
            ) : (
              <XCircle className="mx-auto mb-4" size={64} />
            )}
            <h1 className="text-4xl font-bold mb-2">
              {isPassed ? 'Congratulations! 🎉' : 'Keep Trying! 💪'}
            </h1>
            <p className="text-xl opacity-90 mb-2">
              You {isPassed ? 'passed' : 'did not pass'} the exam
            </p>
            <p className="text-lg opacity-75">
              {exam?.title || 'Exam'}
            </p>
          </div>
        </div>

        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Score</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-primary-50 rounded-lg">
              <Award className="mx-auto text-primary-600 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-1">Marks Obtained</p>
              <p className="text-4xl font-bold text-gray-900">
                {marksObtained.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">out of {totalMarks.toFixed(2)}</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <TrendingUp className="mx-auto text-purple-600 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-1">Percentage</p>
              <p className="text-4xl font-bold text-gray-900">
                {percentage.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Pass mark: {passMarks} ({((passMarks / totalMarks) * 100).toFixed(0)}%)
              </p>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Award className="mx-auto text-blue-600 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-1">Grade</p>
              <p className="text-4xl font-bold text-gray-900">
                {grade}
              </p>
              <p className={`text-sm mt-1 font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {isPassed ? 'PASSED' : 'FAILED'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Your Performance</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-4">
              {/* Pass mark indicator */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                style={{ left: `${(passMarks / totalMarks) * 100}%` }}
                title={`Pass Mark: ${passMarks}`}
              ></div>
              {/* Score bar */}
              <div
                className={`h-4 rounded-full transition-all ${
                  isPassed ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-yellow-600">Pass: {((passMarks / totalMarks) * 100).toFixed(0)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Answer Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Answer Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {totalQuestions}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Correct</p>
                  <p className="text-2xl font-bold text-green-700">
                    {correctAnswers}
                  </p>
                  {totalQuestions > 0 && (
                    <p className="text-xs text-gray-500">
                      {((correctAnswers / totalQuestions) * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Incorrect</p>
                  <p className="text-2xl font-bold text-red-700">
                    {incorrectAnswers}
                  </p>
                  {totalQuestions > 0 && (
                    <p className="text-xs text-gray-500">
                      {((incorrectAnswers / totalQuestions) * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm">
                  ?
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unanswered</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {unanswered}
                  </p>
                  {totalQuestions > 0 && (
                    <p className="text-xs text-gray-500">
                      {((unanswered / totalQuestions) * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy breakdown */}
          {totalQuestions > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Accuracy Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Attempted Questions:</span>
                  <span className="font-medium">{correctAnswers + incorrectAnswers} / {totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Accuracy Rate:</span>
                  <span className="font-medium text-green-600">
                    {correctAnswers + incorrectAnswers > 0 
                      ? ((correctAnswers / (correctAnswers + incorrectAnswers)) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                {exam?.enable_negative_marking && result.negative_marks_applied && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Negative Marks:</span>
                    <span className="font-medium text-red-600">-{parseFloat(result.negative_marks_applied || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Exam Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Exam Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Exam Title</span>
              <span className="font-medium text-gray-900">{exam?.title || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Subject</span>
              <span className="font-medium text-gray-900">{exam?.subject?.name || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Attempt Number</span>
              <span className="font-medium text-gray-900">#{attempt?.attempt_number || 1}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Attempt Code</span>
              <span className="font-medium text-gray-900 font-mono">{attempt?.attempt_code || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">
                <Clock className="inline mr-2" size={16} />
                Time Taken
              </span>
              <span className="font-medium text-gray-900">
                {timeTakenSeconds > 0 ? formatTime(timeTakenSeconds) : 'N/A'}
              </span>
            </div>
            
            {attempt?.started_at && (
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Started At</span>
                <span className="font-medium text-gray-900">
                  {new Date(attempt.started_at).toLocaleString()}
                </span>
              </div>
            )}
            
            {attempt?.submitted_at && (
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Submitted At</span>
                <span className="font-medium text-gray-900">
                  {new Date(attempt.submitted_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center pb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 font-medium"
          >
            <Home size={20} />
            Back to Dashboard
          </button>
          
          {exam && attempt && exam.max_attempts > attempt.attempt_number && !isPassed && (
            <button
              onClick={() => navigate(`/student/exam/${exam.id}/start`)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium"
            >
              Try Again (Attempt {attempt.attempt_number + 1}/{exam.max_attempts})
            </button>
          )}

          {exam?.allow_review_after_submit && (
            <button
              onClick={() => navigate(`/student/exam/${attemptId}/review`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
            >
              <FileText size={20} />
              Review Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}