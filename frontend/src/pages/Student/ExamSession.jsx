import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import studentExamService from '../../services/studentExamService';
import proctoringService from '../../services/proctoringService';

export default function ExamSession() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [violations, setViolations] = useState({
    tabSwitches: 0,
    copyAttempts: 0,
    rightClicks: 0,
  });
  
  const autoSaveInterval = useRef(null);
  const timerInterval = useRef(null);

  // Fetch attempt details
  const { data: attemptData, isLoading, error } = useQuery({
    queryKey: ['exam-attempt', attemptId],
    queryFn: () => studentExamService.getAttempt(attemptId),
    retry: 1,
  });

  console.log('Attempt Data:', attemptData);

  const attempt = attemptData?.data?.attempt;
  const exam = attemptData?.data?.exam;
  const questions = attemptData?.data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Check if exam is already submitted
  useEffect(() => {
    if (attempt?.status === 'submitted') {
      alert('This exam has already been submitted.');
      navigate(`/student/exam/${attemptId}/result`);
    }
  }, [attempt, attemptId, navigate]);

  // PROCTORING: Tab switch detection
  useEffect(() => {
    if (!exam?.enable_tab_switch_detection) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
        proctoringService.logEvent(attemptId, 'tab_switch', {
          timestamp: new Date().toISOString(),
          count: violations.tabSwitches + 1,
        });
        
        alert('⚠️ Warning: Tab switching detected! This activity is being monitored.');
      }
    };

    const handleWindowBlur = () => {
      proctoringService.logEvent(attemptId, 'window_blur', {
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [attemptId, exam, violations.tabSwitches]);

  // PROCTORING: Copy/Paste/Cut prevention
  useEffect(() => {
    if (!exam?.disable_copy_paste) return;

    const handleCopy = (e) => {
      e.preventDefault();
      setViolations(prev => ({ ...prev, copyAttempts: prev.copyAttempts + 1 }));
      proctoringService.logEvent(attemptId, 'copy_attempt', {
        timestamp: new Date().toISOString(),
      });
      alert('⚠️ Copy is disabled during this exam!');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      proctoringService.logEvent(attemptId, 'paste_attempt', {
        timestamp: new Date().toISOString(),
      });
      alert('⚠️ Paste is disabled during this exam!');
    };

    const handleCut = (e) => {
      e.preventDefault();
      proctoringService.logEvent(attemptId, 'cut_attempt', {
        timestamp: new Date().toISOString(),
      });
      alert('⚠️ Cut is disabled during this exam!');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
    };
  }, [attemptId, exam]);

  // PROCTORING: Right-click prevention
  useEffect(() => {
    if (!exam?.disable_copy_paste) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      setViolations(prev => ({ ...prev, rightClicks: prev.rightClicks + 1 }));
      proctoringService.logEvent(attemptId, 'right_click', {
        timestamp: new Date().toISOString(),
      });
      alert('⚠️ Right-click is disabled during this exam!');
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [attemptId, exam]);

  // PROCTORING: Fullscreen enforcement
  useEffect(() => {
    if (!exam?.lock_fullscreen) return;

    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        proctoringService.logEvent(attemptId, 'fullscreen_exit', {
          timestamp: new Date().toISOString(),
        }, 'critical');
        
        alert('⚠️ Critical Warning: You exited fullscreen mode! Please return to fullscreen.');
        enterFullscreen();
      }
    };

    enterFullscreen();
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [attemptId, exam]);

  // PROCTORING: DevTools detection
  useEffect(() => {
    let devtoolsOpen = false;

    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        proctoringService.logEvent(attemptId, 'devtools_open', {
          timestamp: new Date().toISOString(),
        }, 'critical');
        alert('⚠️ Critical Warning: Developer tools detected! This is not allowed during the exam.');
      }
    };

    const interval = setInterval(detectDevTools, 1000);

    return () => clearInterval(interval);
  }, [attemptId]);


  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: (answerData) => studentExamService.saveAnswer(attemptId, answerData),
    onError: (error) => {
      console.error('Save answer error:', error);
    },
  });

  // Submit exam mutation
  const submitMutation = useMutation({
    mutationFn: () => studentExamService.submitExam(attemptId),
    onSuccess: () => {
      navigate(`/student/exam/${attemptId}/result`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(error.response?.data?.message || 'Failed to submit exam');
    },
  });

  // Initialize timer - FIXED
  useEffect(() => {
    if (!exam || !attempt || !attempt.started_at) return;
    
    const startTime = new Date(attempt.started_at).getTime();
    const durationMs = exam.duration_minutes * 60 * 1000;
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeRemaining(remaining);

      // Auto-submit when time runs out
      if (remaining === 0 && !hasAutoSubmitted && !isSubmitting) {
        console.log('Time up! Auto-submitting...');
        handleAutoSubmit();
      }
    };

    // Initial update
    updateTimer();
    
    // Update every second
    timerInterval.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [exam, attempt]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (!currentQuestion) return;

    const saveInterval = setInterval(() => {
      saveCurrentAnswer();
    }, 30000);

    autoSaveInterval.current = saveInterval;

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [currentQuestionIndex, answers, currentQuestion]);

  // Prevent page refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Load existing answers - FIXED
  useEffect(() => {
    if (questions.length > 0) {
      const existingAnswers = {};
      const existingFlags = new Set();
      
      questions.forEach(q => {
        if (q.existing_answer) {
          const answer = {};
          
          // Handle different answer types
          if (q.existing_answer.selected_option_id) {
            answer.selected_option_id = q.existing_answer.selected_option_id;
          }
          if (q.existing_answer.selected_option_ids) {
            answer.selected_option_ids = q.existing_answer.selected_option_ids;
          }
          if (q.existing_answer.answer_text) {
            answer.answer_text = q.existing_answer.answer_text;
          }
          if (q.existing_answer.answer_numeric !== null && q.existing_answer.answer_numeric !== undefined) {
            answer.answer_numeric = q.existing_answer.answer_numeric;
          }
          
          if (Object.keys(answer).length > 0) {
            existingAnswers[q.id] = answer;
          }
          
          if (q.existing_answer.is_flagged) {
            existingFlags.add(q.id);
          }
        }
      });
      
      setAnswers(existingAnswers);
      setFlaggedQuestions(existingFlags);
    }
  }, [questions]);

  const saveCurrentAnswer = () => {
    if (!currentQuestion) return;
    
    const answer = answers[currentQuestion.id];
    if (!answer) return;

    const answerData = {
      question_id: currentQuestion.id,
      ...answer,
      is_flagged: flaggedQuestions.has(currentQuestion.id),
    };

    saveAnswerMutation.mutate(answerData);
  };

  const handleAnswerChange = (questionId, answerData) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerData,
    }));
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    
    setFlaggedQuestions(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(currentQuestion.id)) {
        newFlagged.delete(currentQuestion.id);
      } else {
        newFlagged.add(currentQuestion.id);
      }
      return newFlagged;
    });
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
    if (hasAutoSubmitted || isSubmitting) return;
    
    setHasAutoSubmitted(true);
    setIsSubmitting(true);
    saveCurrentAnswer();
    
    setTimeout(() => {
      submitMutation.mutate();
    }, 1000);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

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
    if (seconds === null) return '--:--:--';
    
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
      case 'true_false':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  questionAnswer.selected_option_id === option.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={questionAnswer.selected_option_id === option.id}
                  onChange={() => handleAnswerChange(currentQuestion.id, {
                    selected_option_id: option.id,
                  })}
                  className="mt-1 h-4 w-4 text-teal-600"
                />
                <span className="flex-1 text-gray-900">
                  <span className="font-medium mr-2">{option.option_key}.</span>
                  {option.option_text}
                </span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice_multiple':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const isSelected = questionAnswer.selected_option_ids?.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentIds = questionAnswer.selected_option_ids || [];
                      const newIds = e.target.checked
                        ? [...currentIds, option.id]
                        : currentIds.filter(id => id !== option.id);
                      handleAnswerChange(currentQuestion.id, {
                        selected_option_ids: newIds,
                      });
                    }}
                    className="mt-1 h-4 w-4 text-teal-600 rounded"
                  />
                  <span className="flex-1 text-gray-900">
                    <span className="font-medium mr-2">{option.option_key}.</span>
                    {option.option_text}
                  </span>
                </label>
              );
            })}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        );

      case 'numeric':
        return (
          <div>
            <input
              type="number"
              step="any"
              value={questionAnswer.answer_numeric ?? ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, {
                answer_numeric: e.target.value === '' ? null : parseFloat(e.target.value),
              })}
              placeholder="Enter your numeric answer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type: {currentQuestion.type}</p>;
    }
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Exam</h2>
          <p className="text-gray-600 mb-6">
            {error.response?.data?.message || 'Failed to load exam session'}
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

  // No data
  if (!exam || !attempt || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto text-yellow-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            This exam doesn't have any questions yet. Please contact your instructor.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Back to Dashboard
          </button>
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
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
              timeRemaining === null 
                ? 'bg-gray-100 text-gray-400'
                : timeRemaining < 300 
                ? 'bg-red-100 text-red-700' 
                : 'bg-teal-100 text-teal-700'
            }`}>
              <Clock size={20} />
              {formatTime(timeRemaining)}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || submitMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || submitMutation.isPending ? 'Submitting...' : 'Submit Exam'}
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
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {currentQuestion?.marks} {parseFloat(currentQuestion?.marks) === 1 ? 'mark' : 'marks'}
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
                className={`ml-4 p-2 rounded-lg transition-colors ${
                  flaggedQuestions.has(currentQuestion?.id)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                }`}
                title="Flag for review"
              >
                <Flag size={20} fill={flaggedQuestions.has(currentQuestion?.id) ? 'currentColor' : 'none'} />
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
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        ? 'ring-2 ring-teal-600 ring-offset-2'
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