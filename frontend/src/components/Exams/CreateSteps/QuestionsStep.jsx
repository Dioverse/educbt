import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Search, Edit2 } from 'lucide-react';
import questionService from '../../../services/questionService';
import useExamStore from '../../../store/examStore';

export default function QuestionsStep({ errors }) {
  const { examFormData, addQuestion, removeQuestion, updateQuestionMarks } = useExamStore();
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Fetch questions
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['questions', subjectFilter],
    queryFn: () => questionService.getQuestions({ subject_id: subjectFilter }),
  });

  const selectedQuestions = examFormData.questions || [];

  // Filter available questions
  const availableQuestions = questionsData?.data?.filter(q => {
    const notSelected = !selectedQuestions.find(sq => sq.id === q.id);
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    return notSelected && matchesSearch;
  }) || [];

  const handleAddQuestion = (question) => {
    addQuestion(question);
  };

  const handleRemoveQuestion = (questionId) => {
    removeQuestion(questionId);
  };

  const handleUpdateMarks = (questionId) => {
    if (editingQuestion) {
      updateQuestionMarks(
        questionId,
        parseFloat(editingQuestion.marks),
        parseFloat(editingQuestion.negative_marks)
      );
      setEditingQuestion(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Questions</h2>
        <p className="text-gray-600">Add questions to your exam from the question bank</p>
      </div>

      {errors.questions && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {errors.questions}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-teal-50 rounded-lg">
          <p className="text-sm text-teal-600 mb-1">Selected Questions</p>
          <p className="text-3xl font-bold text-teal-900">{selectedQuestions.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Total Marks</p>
          <p className="text-3xl font-bold text-green-900">{examFormData.total_marks}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 mb-1">Pass Marks</p>
          <p className="text-3xl font-bold text-blue-900">{examFormData.pass_marks || 0}</p>
        </div>
      </div>

      {/* Add Questions Button */}
      <div>
        <button
          type="button"
          onClick={() => setShowQuestionPicker(!showQuestionPicker)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={20} />
          {showQuestionPicker ? 'Hide Question Bank' : 'Add Questions from Bank'}
        </button>
      </div>

      {/* Question Picker */}
      {showQuestionPicker && (
        <div className="border-2 border-teal-200 rounded-lg p-4 bg-teal-50">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Subjects</option>
              {/* Add subjects here */}
            </select>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 bg-white rounded-lg p-2">
            {isLoading ? (
              <p className="text-center py-8 text-gray-500">Loading questions...</p>
            ) : availableQuestions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No questions available</p>
            ) : (
              availableQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-teal-400 cursor-pointer bg-white"
                  onClick={() => handleAddQuestion(question)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {question.question_text.substring(0, 150)}
                        {question.question_text.length > 150 && '...'}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {question.type}
                        </span>
                        <span>Marks: {question.marks}</span>
                        <span>Difficulty: {question.difficulty_level}</span>
                        {question.subject && <span>Subject: {question.subject.name}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Questions List */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Selected Questions ({selectedQuestions.length})
        </h3>

        {selectedQuestions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No questions selected yet</p>
            <p className="text-sm text-gray-400 mt-2">Click "Add Questions from Bank" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedQuestions.map((item, index) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      {item.question?.question_text || item.question_text}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {item.question?.type || item.type}
                      </span>
                      
                      {editingQuestion?.id === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingQuestion.marks}
                            onChange={(e) => setEditingQuestion({
                              ...editingQuestion,
                              marks: e.target.value
                            })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            placeholder="Marks"
                          />
                          <input
                            type="number"
                            value={editingQuestion.negative_marks}
                            onChange={(e) => setEditingQuestion({
                              ...editingQuestion,
                              negative_marks: e.target.value
                            })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                            placeholder="Neg."
                          />
                          <button
                            onClick={() => handleUpdateMarks(item.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingQuestion(null)}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span>Marks: {item.marks}</span>
                          {item.negative_marks > 0 && (
                            <span className="text-red-600">Negative: -{item.negative_marks}</span>
                          )}
                          <button
                            onClick={() => setEditingQuestion({
                              id: item.id,
                              marks: item.marks,
                              negative_marks: item.negative_marks || 0
                            })}
                            className="text-teal-600 hover:underline flex items-center gap-1"
                          >
                            <Edit2 size={14} />
                            Edit Marks
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}