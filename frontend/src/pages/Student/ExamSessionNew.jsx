import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import studentExamService from '../../services/studentExamService';
import liveProctoringService from '../../services/liveProctoringService';

export default function ExamSession() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const autoSaveInterval = useRef(null);
  const heartbeatInterval = useRef(null);
  const timerInterval = useRef(null);

  // Fetch attempt details
  const { data: attemptData, isLoading } = useQuery({
    queryKey: ['exam-attempt', attemptId],
    queryFn: () => studentExamService.getAttempt(attemptId),
  });

  const attempt = attemptData?.data?.attempt;
  const exam = attemptData?.data?.exam;
  const questions = attemptData?.data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: (answerData) => studentExamService.saveAnswer(attemptId, answerData),
  });

  // Submit exam mutation
  const submitMutation = useMutation({
    mutationFn: () => studentExamService.submitExam(attemptId),
    onSuccess: () => {
      navigate(`/student/exam/${attemptId}/result`);
    },
  });

  // Initialize timer
  useEffect(() => {
    if (exam && attempt) {
      const startTime = new Date(attempt.started_at).getTime();
      const durationMs = exam.duration_minutes * 60 * 1000;
      const endTime = startTime + durationMs;

      timerInterval.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleAutoSubmit();
        }
      }, 1000);

      return () => clearInterval(timerInterval.current);
    }
  }, [exam, attempt]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    autoSaveInterval.current = setInterval(() => {
      saveCurrentAnswer();
    }, 30000);

    return () => clearInterval(autoSaveInterval.current);
  }, [currentQuestionIndex, answers]);

  // Send heartbeat every 30 seconds
  useEffect(() => {
    heartbeatInterval.current = setInterval(() => {
      liveProctoringService.sendHeartbeat(attemptId, currentQuestionIndex)
        .catch(err => console.error('Heartbeat failed:', err));
    }, 30000);

    return () => clearInterval(heartbeatInterval.current);
  }, [attemptId, currentQuestionIndex]);

  // Prevent page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const saveCurrentAnswer = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return;

    const answerData = {
      question_id: currentQuestion.id,
      ...answers[currentQuestion.id],
      is_flagged: flaggedQuestions.has(currentQuestion.id),
    };

    saveAnswerMutation.mutate(answerData);
  };

  const handleAnswerChange = (questionId, answerData) => {
    setAnswers({
      ...answers,
      [questionId]: answerData,
    });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const goToQuestion = (index) => {
    saveCurrentAnswer();
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      saveCurrentAnswer();
      setTimeout(() => {
        submitMutation.mutate();
      }, 1000);
    }
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(q => !answers[q.id]).length;
    const flagged = flaggedQuestions.size;

    let message = 'Are you sure you want to submit your exam?';
    if (unanswered > 0) {
      message += `\n\n⚠️ You have ${unanswered} unanswered question(s).`;
    }
    if (flagged > 0) {
      message += `\n\n🚩 You have ${flagged} flagged question(s) for review.`;
    }

    if (confirm(message)) {
      setIsSubmitting(true);
      saveCurrentAnswer();
      setTimeout(() => {
        submitMutation.mutate();
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (question) => {
    if (answers[question.id]) return 'answered';
    if (flaggedQuestions.has(question.id)) return 'flagged';
    return 'unanswered';
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const questionAnswer = answers[currentQuestion.id] || {};

    switch (currentQuestion.type) {
      case 'multiple_choice_single':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={questionAnswer.selected_option_id === option.id}
                  onChange={() => handleAnswerChange(currentQuestion.id, {
                    selected_option_id: option.id,
                  })}
                  className="mt-1 h-4 w-4 text-primary-600"
                />
                <span className="flex-1 text-gray-900">
                  {option.option_key}. {option.option_text}
                </span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice_multiple':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={questionAnswer.selected_option_ids?.includes(option.id)}
                  onChange={(e) => {
                    const currentIds = questionAnswer.selected_option_ids || [];
                    const newIds = e.target.checked
                      ? [...currentIds, option.id]
                      : currentIds.filter(id => id !== option.id);
                    handleAnswerChange(currentQuestion.id, {
                      selected_option_ids: newIds,
                    });
                  }}
                  className="mt-1 h-4 w-4 text-primary-600 rounded"
                />
                <span className="flex-1 text-gray-900">
                  {option.option_key}. {option.option_text}
                </span>
              </label>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={questionAnswer.selected_option_id === option.id}
                  onChange={() => handleAnswerChange(currentQuestion.id, {
                    selected_option_id: option.id,
                  })}
                  className="mt-1 h-4 w-4 text-primary-600"
                />
                <span className="flex-1 text-gray-900 font-medium">
                  {option.option_text}
                </span>
              </label>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <div>
            <input
              type="text"
              value={questionAnswer.answer_text || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, {
                answer_text: e.target.value,
              })}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );

      case 'numeric':
        return (
          <div>
            <input
              type="number"
              step="any"
              value={questionAnswer.answer_numeric || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, {
                answer_numeric: parseFloat(e.target.value) || null,
              })}
              placeholder="Enter your numeric answer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );

      case 'essay':
        return (
          <div>
            <textarea
              value={questionAnswer.answer_text || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, {
                answer_text: e.target.value,
              })}
              rows={10}
              placeholder="Write your essay answer here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {currentQuestion.min_words && (
              <p className="mt-2 text-sm text-gray-600">
                Minimum words: {currentQuestion.min_words}
              </p>
            )}
            {currentQuestion.max_words && (
              <p className="mt-1 text-sm text-gray-600">
                Maximum words: {currentQuestion.max_words}
              </p>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam?.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'
            }`}>
              <Clock size={20} />
              {formatTime(timeRemaining)}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        {/* Main Question Area */}
        <div className="flex-1 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {currentQuestion?.marks} {currentQuestion?.marks === 1 ? 'mark' : 'marks'}
                  </span>
                  {currentQuestion?.negative_marks > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      -{currentQuestion.negative_marks} for wrong answer
                    </span>
                  )}
                </div>

                <div className="text-lg text-gray-900 mb-6 leading-relaxed">
                  {currentQuestion?.question_text}
                </div>

                {renderQuestionInput()}
              </div>

              <button
                onClick={toggleFlag}
                className={`ml-4 p-2 rounded-lg ${
                  flaggedQuestions.has(currentQuestion?.id)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                }`}
                title="Flag for review"
              >
                <Flag size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="w-80 space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Answered:</span>
                <span className="font-medium text-green-600">
                  {Object.keys(answers).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unanswered:</span>
                <span className="font-medium text-red-600">
                  {questions.length - Object.keys(answers).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Flagged:</span>
                <span className="font-medium text-yellow-600">
                  {flaggedQuestions.size}
                </span>
              </div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
            
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const status = getQuestionStatus(question);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`
                      w-full aspect-square rounded-lg font-medium text-sm transition-all
                      ${isCurrent
                        ? 'ring-2 ring-primary-600 ring-offset-2'
                        : ''
                      }
                      ${status === 'answered'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : status === 'flagged'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span className="text-gray-600">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                <span className="text-gray-600">Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}