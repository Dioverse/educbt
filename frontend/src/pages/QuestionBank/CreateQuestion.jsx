import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import questionService from '../../services/questionService';
import subjectService from '../../services/subjectService';
import topicService from '../../services/topicService';
import QuestionTypeSelector from '../../components/QuestionBank/QuestionTypeSelector';
import MultipleChoiceForm from '../../components/QuestionBank/QuestionTypes/MultipleChoiceForm';
import TrueFalseForm from '../../components/QuestionBank/QuestionTypes/TrueFalseForm';
import ShortAnswerForm from '../../components/QuestionBank/QuestionTypes/ShortAnswerForm';
import NumericForm from '../../components/QuestionBank/QuestionTypes/NumericForm';
import EssayForm from '../../components/QuestionBank/QuestionTypes/EssayForm';

export default function CreateQuestion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: '',
    question_text: '',
    question_html: '',
    explanation: '',
    explanation_html: '',
    subject_id: '',
    topic_id: '',
    difficulty_level: 'medium',
    tags: [],
    marks: 1,
    negative_marks: 0,
    is_active: true,
    options: [],
    correct_answer_numeric: null,
    tolerance: null,
    correct_answer_text: '',
    case_sensitive: false,
    min_words: null,
    max_words: null,
    allow_file_upload: false,
    allowed_file_types: [],
    max_file_size_kb: 10240,
    pairs_data: [],
  });

  const [errors, setErrors] = useState({});

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getSubjects,
  });

  // Fetch topics based on selected subject
  const { data: topicsData } = useQuery({
    queryKey: ['topics', formData.subject_id],
    queryFn: () => topicService.getTopics(formData.subject_id),
    enabled: !!formData.subject_id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: questionService.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      navigate('/questions');
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to create question: ' + (error.response?.data?.message || error.message));
      }
    },
  });

  const handleSubmit = (e) => {
  e.preventDefault();
  setErrors({});
  
  // Validation
  const newErrors = {};
  
  if (!formData.type) {
    newErrors.type = 'Question type is required';
  }
  
  if (!formData.question_text.trim()) {
    newErrors.question_text = 'Question text is required';
  }
  
  if (!formData.subject_id) {
    newErrors.subject_id = 'Subject is required';
  }
  
  if (!formData.marks || formData.marks <= 0) {
    newErrors.marks = 'Marks must be greater than 0';
  }

  // Type-specific validation
  if (formData.type === 'multiple_choice_single' || formData.type === 'multiple_choice_multiple') {
    if (!formData.options || formData.options.length < 2) {
      newErrors.options = 'At least 2 options are required';
    } else {
      const hasCorrect = formData.options.some(opt => opt.is_correct);
      if (!hasCorrect) {
        newErrors.options = 'At least one correct answer is required';
      }
    }
  }

  if (formData.type === 'numeric') {
    if (!formData.correct_answer_numeric && formData.correct_answer_numeric !== 0) {
      newErrors.correct_answer_numeric = 'Correct answer is required for numeric questions';
    }
  }

  if (formData.type === 'short_answer' && !formData.correct_answer_text) {
    newErrors.correct_answer_text = 'Correct answer is required for short answer questions';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // ✅ ADD THIS: Preprocess data before sending
  const submitData = { ...formData };
  
  // Add option_key to options if missing
  if (submitData.options && submitData.options.length > 0) {
    submitData.options = submitData.options.map((option, index) => ({
      ...option,
      option_key: option.option_key || String.fromCharCode(65 + index), // A, B, C, D...
    }));
  }

  console.log('Submitting question data:', submitData);
  createMutation.mutate(submitData);
};

  const updateFormData = (updates) => {
    setFormData({ ...formData, ...updates });
  };

  const renderQuestionTypeForm = () => {
    switch (formData.type) {
      case 'multiple_choice_single':
      case 'multiple_choice_multiple':
        return (
          <MultipleChoiceForm
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            multipleAnswers={formData.type === 'multiple_choice_multiple'}
          />
        );
      
      case 'true_false':
        return (
          <TrueFalseForm
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      
      case 'short_answer':
        return (
          <ShortAnswerForm
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      
      case 'numeric':
        return (
          <NumericForm
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      
      case 'essay':
        return (
          <EssayForm
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      
      default:
        return (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Select a question type to continue</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Question</h1>
          <p className="text-gray-600 mt-1">Add a new question to your question bank</p>
        </div>
        <button
          onClick={() => navigate('/questions')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Questions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          {/* Question Type Selector */}
          <QuestionTypeSelector
            value={formData.type}
            onChange={(type) => updateFormData({ type })}
            error={errors.type}
          />

          {/* Subject and Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => updateFormData({ 
                  subject_id: e.target.value,
                  topic_id: '' // Reset topic when subject changes
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.subject_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Subject</option>
                {subjectsData?.data?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subject_id && (
                <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={formData.topic_id}
                onChange={(e) => updateFormData({ topic_id: e.target.value })}
                disabled={!formData.subject_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Topic</option>
                {topicsData?.data?.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty and Marks */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => updateFormData({ difficulty_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.marks}
                onChange={(e) => updateFormData({ marks: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.marks ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.marks && (
                <p className="mt-1 text-sm text-red-600">{errors.marks}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Marks
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.negative_marks}
                onChange={(e) => updateFormData({ negative_marks: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => updateFormData({ 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              placeholder="algebra, equations, grade-10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Question Type Specific Form */}
        {formData.type && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Question Details</h2>
            {renderQuestionTypeForm()}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/questions')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {createMutation.isPending ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
}