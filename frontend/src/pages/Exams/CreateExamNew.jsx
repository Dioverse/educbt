import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import examService from '../../services/examService';
import subjectService from '../../services/subjectService';
import questionService from '../../services/questionService';

export default function CreateExam() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    duration_minutes: 60,
    total_marks: 0,
    pass_marks: 0,
    start_date: '',
    end_date: '',
    instructions: '',
    status: 'draft',
    shuffle_questions: false,
    shuffle_options: false,
    show_results_immediately: true,
    allow_review: true,
    enable_negative_marking: false,
    max_attempts: 1,
    enable_tab_switch_detection: false,
    disable_copy_paste: false,
    lock_fullscreen: false,
    require_webcam: false,
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getSubjects,
  });

  // Fetch questions for selection
  const { data: questionsData } = useQuery({
    queryKey: ['questions'],
    queryFn: questionService.getQuestions,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: examService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      navigate('/exams');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create exam');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    const submitData = {
      ...formData,
      questions: selectedQuestions.map((q, index) => ({
        question_id: q.id,
        marks: q.marks,
        negative_marks: q.negative_marks || 0,
        display_order: index + 1,
        is_mandatory: true,
      })),
    };

    createMutation.mutate(submitData);
  };

  const addQuestion = (question) => {
    if (!selectedQuestions.find(q => q.id === question.id)) {
      setSelectedQuestions([...selectedQuestions, question]);
      
      // Update total marks
      setFormData({
        ...formData,
        total_marks: formData.total_marks + question.marks,
      });
    }
  };

  const removeQuestion = (questionId) => {
    const question = selectedQuestions.find(q => q.id === questionId);
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
    
    // Update total marks
    if (question) {
      setFormData({
        ...formData,
        total_marks: Math.max(0, formData.total_marks - question.marks),
      });
    }
  };

  const availableQuestions = questionsData?.data?.filter(q => 
    !selectedQuestions.find(sq => sq.id === q.id) &&
    q.question_text.toLowerCase().includes(questionSearch.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Exam</h1>
          <p className="text-gray-600 mt-1">Set up a new exam for your students</p>
        </div>
        <button
          onClick={() => navigate('/exams')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Subject</option>
                {subjectsData?.data?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks (Auto-calculated)
              </label>
              <input
                type="number"
                value={formData.total_marks}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pass Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.pass_marks}
                onChange={(e) => setFormData({ ...formData, pass_marks: parseFloat(e.target.value) })}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              placeholder="Enter instructions for students..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Questions Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Questions ({selectedQuestions.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowQuestionPicker(!showQuestionPicker)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Questions
            </button>
          </div>

          {/* Question Picker Modal */}
          {showQuestionPicker && (
            <div className="mb-6 p-4 border-2 border-teal-200 rounded-lg bg-teal-50">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-3 bg-white border border-gray-200 rounded-lg hover:border-teal-400 cursor-pointer"
                    onClick={() => addQuestion(question)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {question.question_text.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                          <span>Type: {question.type}</span>
                          <span>•</span>
                          <span>Marks: {question.marks}</span>
                          <span>•</span>
                          <span>Difficulty: {question.difficulty_level}</span>
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
                ))}

                {availableQuestions.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    No questions available
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowQuestionPicker(false)}
                className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          )}

          {/* Selected Questions */}
          {selectedQuestions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No questions selected. Click "Add Questions" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <div key={question.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {index + 1}. {question.question_text}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Type: {question.type} | Marks: {question.marks} | Difficulty: {question.difficulty_level}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Exam Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffle_questions}
                onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded"
              />
              <span className="text-sm text-gray-700">Shuffle questions</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffle_options}
                onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded"
              />
              <span className="text-sm text-gray-700">Shuffle answer options</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_results_immediately}
                onChange={(e) => setFormData({ ...formData, show_results_immediately: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded"
              />
              <span className="text-sm text-gray-700">Show results immediately</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_negative_marking}
                onChange={(e) => setFormData({ ...formData, enable_negative_marking: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded"
              />
              <span className="text-sm text-gray-700">Enable negative marking</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_webcam}
                onChange={(e) => setFormData({ ...formData, require_webcam: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded"
              />
              <span className="text-sm text-gray-700">Require webcam</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.disable_copy_paste}
                onChange={(e) => setFormData({ ...formData, disable_copy_paste: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded"
              />
              <span className="text-sm text-gray-700">Disable copy/paste</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Attempts
            </label>
            <input
              type="number"
              value={formData.max_attempts}
              onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || selectedQuestions.length === 0}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {createMutation.isPending ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}