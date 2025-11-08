import { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Copy, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import useQuestionStore from '../../store/questionStore';

export default function QuestionCard({ question, onEdit, onDelete, onDuplicate, onView }) {
  const [showMenu, setShowMenu] = useState(false);
  const { selectedQuestions, toggleSelectQuestion } = useQuestionStore();

  const isSelected = selectedQuestions.includes(question.id);

  const questionTypeLabels = {
    multiple_choice_single: 'Multiple Choice (Single)',
    multiple_choice_multiple: 'Multiple Choice (Multiple)',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    numeric: 'Numeric',
    essay: 'Essay',
    image_based: 'Image Based',
    audio_video: 'Audio/Video',
    match_following: 'Match Following',
    drag_drop: 'Drag & Drop',
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
        isSelected ? 'border-blue-500' : 'border-transparent'
      } hover:shadow-md`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelectQuestion(question.id)}
            className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Question Code and Type */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">
                    {question.code}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {questionTypeLabels[question.type]}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      difficultyColors[question.difficulty_level]
                    }`}
                  >
                    {question.difficulty_level}
                  </span>
                </div>

                {/* Question Text */}
                <h3
                  className="text-lg font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => onView(question.id)}
                >
                  {question.question_text.substring(0, 150)}
                  {question.question_text.length > 150 && '...'}
                </h3>

                {/* Subject and Topic */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  {question.subject && (
                    <span>
                      <span className="font-medium">Subject:</span> {question.subject.name}
                    </span>
                  )}
                  {question.topic && (
                    <span>
                      <span className="font-medium">Topic:</span> {question.topic.name}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Marks: {question.marks}</span>
                  {question.negative_marks > 0 && (
                    <span>Negative: -{question.negative_marks}</span>
                  )}
                  <span>Used: {question.times_used} times</span>
                  {question.is_verified ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <XCircle size={16} />
                      Not Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        onView(question.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        onEdit(question.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(question.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        onDelete(question.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}