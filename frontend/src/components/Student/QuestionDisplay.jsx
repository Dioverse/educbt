import { FileText, Image as ImageIcon, Award } from 'lucide-react';

export default function QuestionDisplay({ question, questionNumber }) {
  if (!question) return null;

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
            <span className="font-bold text-primary-600">Q{questionNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(question.question?.difficulty_level)}`}>
              {question.question?.difficulty_level}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {question.question?.type?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Award size={16} className="text-purple-600" />
          <span className="font-semibold text-gray-900">{question.marks} marks</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <div 
          className="text-lg text-gray-900 leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{ __html: question.question?.question_text }}
        />
      </div>

      {/* Question Image */}
      {question.question?.question_image_url && (
        <div className="mb-6">
          <img
            src={question.question.question_image_url}
            alt="Question"
            className="max-w-full rounded-lg border border-gray-200"
          />
        </div>
      )}

      {/* Additional Instructions */}
      {question.question?.instructions && (
        <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-900">
            <strong>Instructions:</strong> {question.question.instructions}
          </p>
        </div>
      )}

      {/* Attachments */}
      {question.question?.attachments && question.question.attachments.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
          <div className="space-y-2">
            {question.question.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText size={20} className="text-gray-600" />
                <span className="text-sm text-gray-900">{attachment.file_name}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {(attachment.file_size / 1024).toFixed(2)} KB
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}