import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import rubricService from '../../services/rubricService';
import subjectService from '../../services/subjectService';

export default function CreateRubric() {
  const { rubricId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!rubricId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject_id: '',
    question_type: 'essay',
    max_score: 100,
    is_default: false,
    criteria: [
      { criterion_name: '', description: '', max_points: 0, weight_percentage: 0 },
    ],
  });

  const [errors, setErrors] = useState({});

  // Fetch rubric if editing
  const { data: rubricData } = useQuery({
    queryKey: ['rubric', rubricId],
    queryFn: () => rubricService.getRubric(rubricId),
    enabled: isEdit,
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getSubjects,
  });

  // Load rubric data when editing
  useEffect(() => {
    if (rubricData?.data) {
      const rubric = rubricData.data;
      setFormData({
        name: rubric.name,
        description: rubric.description || '',
        subject_id: rubric.subject_id || '',
        question_type: rubric.question_type,
        max_score: rubric.max_score,
        is_default: rubric.is_default,
        criteria: rubric.criteria?.length > 0 ? rubric.criteria : [
          { criterion_name: '', description: '', max_points: 0, weight_percentage: 0 },
        ],
      });
    }
  }, [rubricData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return rubricService.updateRubric(rubricId, data);
      }
      return rubricService.createRubric(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rubrics']);
      navigate('/grading/rubrics');
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleAddCriterion = () => {
    setFormData({
      ...formData,
      criteria: [
        ...formData.criteria,
        { criterion_name: '', description: '', max_points: 0, weight_percentage: 0 },
      ],
    });
  };

  const handleRemoveCriterion = (index) => {
    if (formData.criteria.length <= 1) {
      alert('You must have at least one criterion');
      return;
    }
    const newCriteria = formData.criteria.filter((_, i) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleCriterionChange = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index][field] = field === 'weight_percentage' || field === 'max_points' 
      ? parseFloat(value) || 0 
      : value;
    setFormData({ ...formData, criteria: newCriteria });
  };

  const getTotalWeight = () => {
    return formData.criteria.reduce((sum, c) => sum + (c.weight_percentage || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Rubric name is required';
    }
    if (formData.criteria.some(c => !c.criterion_name.trim())) {
      newErrors.criteria = 'All criteria must have a name';
    }
    if (getTotalWeight() !== 100) {
      newErrors.total_weight = 'Total weight must equal 100%';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveMutation.mutate(formData);
  };

  const totalWeight = getTotalWeight();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/grading/rubrics')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Rubric' : 'Create New Rubric'}
          </h1>
          <p className="text-gray-600 mt-1">
            Define grading criteria and scoring weights
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubric Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Essay Grading Rubric"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Brief description of this rubric..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="essay">Essay</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="file_upload">File Upload</option>
                  <option value="all">All Types</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Subjects</option>
                  {subjectsData?.data?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Score
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor="is_default" className="text-sm text-gray-700">
                Set as default rubric for this question type
              </label>
            </div>
          </div>
        </div>

        {/* Criteria */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Grading Criteria</h3>
              <p className="text-sm text-gray-600 mt-1">
                Define the criteria and their weights (must total 100%)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Weight</p>
              <p className={`text-2xl font-bold ${
                totalWeight === 100 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalWeight}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {formData.criteria.map((criterion, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center font-semibold text-teal-600">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={criterion.criterion_name}
                      onChange={(e) => handleCriterionChange(index, 'criterion_name', e.target.value)}
                      placeholder="Criterion name (e.g., Content Quality)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />

                    <textarea
                      value={criterion.description}
                      onChange={(e) => handleCriterionChange(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Max Points
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={criterion.max_points}
                          onChange={(e) => handleCriterionChange(index, 'max_points', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={criterion.weight_percentage}
                          onChange={(e) => handleCriterionChange(index, 'weight_percentage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    disabled={formData.criteria.length <= 1}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddCriterion}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 text-gray-600 hover:text-teal-600 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Criterion
          </button>

          {errors.criteria && (
            <p className="mt-2 text-sm text-red-600">{errors.criteria}</p>
          )}
          {errors.total_weight && (
            <p className="mt-2 text-sm text-red-600">{errors.total_weight}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/grading/rubrics')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saveMutation.isPending ? 'Saving...' : (isEdit ? 'Update Rubric' : 'Create Rubric')}
          </button>
        </div>
      </form>
    </div>
  );
}