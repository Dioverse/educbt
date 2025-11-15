import { X, Circle, CheckCircle, Flag } from 'lucide-react';

export default function QuestionNavigator({ 
  questions, 
  answers, 
  currentIndex, 
  onQuestionSelect,
  onClose,
}) {
  const getQuestionStatus = (question) => {
    const answer = answers[question.question_id];
    
    if (answer?.is_marked_for_review) {
      return 'marked';
    }
    if (answer?.is_answered) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'marked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'answered':
        return <CheckCircle size={16} />;
      case 'marked':
        return <Flag size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const answeredCount = Object.values(answers).filter(a => a?.is_answered).length;
  const markedCount = Object.values(answers).filter(a => a?.is_marked_for_review).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Question Navigator</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-green-100 border border-green-300"></div>
              <span className="text-gray-700">Answered</span>
            </div>
            <span className="font-semibold text-gray-900">{answeredCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-yellow-100 border border-yellow-300"></div>
              <span className="text-gray-700">Marked</span>
            </div>
            <span className="font-semibold text-gray-900">{markedCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-100 border border-gray-300"></div>
              <span className="text-gray-700">Not Answered</span>
            </div>
            <span className="font-semibold text-gray-900">{unansweredCount}</span>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const status = getQuestionStatus(question);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative h-12 rounded border-2 font-semibold text-sm
                  transition-all hover:scale-105
                  ${isCurrent 
                    ? 'border-primary-500 ring-2 ring-blue-200' 
                    : 'border-transparent'
                  }
                  ${getStatusColor(status)}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{index + 1}</span>
                  <div className="absolute -top-1 -right-1">
                    {status === 'marked' && (
                      <Flag size={12} className="text-yellow-600" fill="currentColor" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Progress</span>
            <span className="font-semibold">
              {answeredCount} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}