import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useQuestionStore from '../../store/questionStore';
import subjectService from '../../services/subjectService';
import topicService from '../../services/topicService';

export default function QuestionFilters({ onClose }) {
  const { filters, setFilters, resetFilters } = useQuestionStore();
  
  const [localFilters, setLocalFilters] = useState(filters);

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getSubjects,
  });

  // Fetch topics based on selected subject
  const { data: topicsData } = useQuery({
    queryKey: ['topics', localFilters.subject_id],
    queryFn: () => topicService.getTopics(localFilters.subject_id),
    enabled: !!localFilters.subject_id,
  });

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters({
      search: '',
      type: '',
      difficulty: '',
      subject_id: '',
      topic_id: '',
      is_active: '',
      is_verified: '',
      tags: [],
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  const questionTypes = [
    { value: 'multiple_choice_single', label: 'Multiple Choice (Single)' },
    { value: 'multiple_choice_multiple', label: 'Multiple Choice (Multiple)' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'essay', label: 'Essay' },
    { value: 'image_based', label: 'Image Based' },
    { value: 'audio_video', label: 'Audio/Video' },
    { value: 'match_following', label: 'Match Following' },
    { value: 'drag_drop', label: 'Drag & Drop' },
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
  ];

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, type: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={localFilters.difficulty}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, difficulty: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            value={localFilters.subject_id}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                subject_id: e.target.value,
                topic_id: '', // Reset topic when subject changes
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjectsData?.data?.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <select
            value={localFilters.topic_id}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, topic_id: e.target.value })
            }
            disabled={!localFilters.subject_id}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">All Topics</option>
            {topicsData?.data?.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={localFilters.is_active}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, is_active: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Verified Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification
          </label>
          <select
            value={localFilters.is_verified}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, is_verified: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="1">Verified</option>
            <option value="0">Not Verified</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}