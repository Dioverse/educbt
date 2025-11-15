import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Filter, Check } from 'lucide-react';
import questionService from '../../services/questionService';
import subjectService from '../../services/subjectService';

export default function QuestionBrowser({ onClose, onSelect, selectedQuestions = [] }) {
  const [filters, setFilters] = useState({
    search: '',
    subject_id: '',
    difficulty: '',
    type: '',
  });
  const [localSelected, setLocalSelected] = useState(
    selectedQuestions.map(q => q.id)
  );

  // Fetch questions
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['questions-browser', filters],
    queryFn: () => questionService.getQuestions({
      ...filters,
      per_page: 50,
    }),
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getSubjects,
  });

  const toggleQuestion = (questionId) => {
    setLocalSelected(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    const allIds = questionsData?.data?.map(q => q.id) || [];
    setLocalSelected(allIds);
  };

  const handleDeselectAll = () => {
    setLocalSelected([]);
  };

  const handleConfirm = () => {
    const selected = questionsData?.data?.filter(q => 
      localSelected.includes(q.id)
    ) || [];
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Questions</h2>
            <p className="text-sm text-gray-600 mt-1">
              {localSelected.length} question(s) selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            
            <select
              value={filters.subject_id}
              onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Subjects</option>
              {subjectsData?.data?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="multiple_choice_single">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="short_answer">Short Answer</option>
              <option value="numeric">Numeric</option>
              <option value="essay">Essay</option>
            </select>
          </div>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading questions...</p>
            </div>
          ) : questionsData?.data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No questions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {questionsData?.data?.map((question) => (
                <div
                  key={question.id}
                  onClick={() => toggleQuestion(question.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    localSelected.includes(question.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        localSelected.includes(question.id)
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {localSelected.includes(question.id) && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                            {question.type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            {question.difficulty_level}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {question.marks} marks
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-2">
                        {question.question_text.substring(0, 200)}
                        {question.question_text.length > 200 && '...'}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {question.subject && <span>Subject: {question.subject.name}</span>}
                        {question.topic && <span>Topic: {question.topic.name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-600">
            {localSelected.length} question(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={localSelected.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {localSelected.length} Question(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}