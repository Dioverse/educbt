import { useQuery } from '@tanstack/react-query';
import useExamStore from '../../../store/examStore';
import subjectService from '../../../services/subjectService';

export default function BasicInfoStep({ errors }) {
  const { examFormData, updateExamFormData } = useExamStore();

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getSubjects,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <p className="text-gray-600 mb-6">
          Provide the basic details about your exam
        </p>
      </div>

      {/* Exam Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exam Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={examFormData.title}
          onChange={(e) => updateExamFormData({ title: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Final Mathematics Exam - Grade 10"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={examFormData.description}
          onChange={(e) => updateExamFormData({ description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Provide a brief description of this exam..."
        />
      </div>

      {/* Subject and Grade Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            value={examFormData.subject_id}
            onChange={(e) => updateExamFormData({ subject_id: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
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
            Grade Level
          </label>
          <select
            value={examFormData.grade_level_id}
            onChange={(e) => updateExamFormData({ grade_level_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Grade Level</option>
            <option value="1">Grade 10</option>
            <option value="2">Grade 11</option>
            <option value="3">Grade 12</option>
          </select>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exam Instructions
        </label>
        <textarea
          value={examFormData.instructions}
          onChange={(e) => updateExamFormData({ instructions: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Enter instructions for students taking this exam..."
        />
        <p className="mt-1 text-xs text-gray-500">
          These instructions will be shown to students before they start the exam
        </p>
      </div>

      {/* Access Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Access Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={examFormData.is_public}
              onChange={(e) => updateExamFormData({ is_public: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_public" className="text-sm text-gray-700">
              Make this exam public (accessible to all users)
            </label>
          </div>

          {!examFormData.is_public && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code (Optional)
              </label>
              <input
                type="text"
                value={examFormData.access_code}
                onChange={(e) => updateExamFormData({ access_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Enter access code if required"
              />
              <p className="mt-1 text-xs text-gray-500">
                Students will need this code to access the exam
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}