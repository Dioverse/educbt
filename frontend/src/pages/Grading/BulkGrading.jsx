import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckSquare, Save } from 'lucide-react';
import gradingService from '../../services/gradingService';
import rubricService from '../../services/rubricService';

export default function BulkGrading() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [bulkMarks, setBulkMarks] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [selectedRubric, setSelectedRubric] = useState('');

  // Fetch pending grading
  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['pending-grading'],
    queryFn: () => gradingService.getPendingGrading(),
  });

  // Fetch rubrics
  const { data: rubricsData } = useQuery({
    queryKey: ['rubrics'],
    queryFn: rubricService.getRubrics,
  });

  // Bulk grade mutation
  const bulkGradeMutation = useMutation({
    mutationFn: (data) => gradingService.bulkGrade(selectedAnswers, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-grading']);
      queryClient.invalidateQueries(['grading-statistics']);
      setSelectedAnswers([]);
      setBulkMarks('');
      setBulkFeedback('');
      navigate('/grading/dashboard');
    },
  });

  const pendingAnswers = pendingData?.data || [];
  const rubrics = rubricsData?.data || [];

  const handleSelectAll = () => {
    if (selectedAnswers.length === pendingAnswers.length) {
      setSelectedAnswers([]);
    } else {
      setSelectedAnswers(pendingAnswers.map(a => a.id));
    }
  };

  const handleToggleAnswer = (id) => {
    if (selectedAnswers.includes(id)) {
      setSelectedAnswers(selectedAnswers.filter(aid => aid !== id));
    } else {
      setSelectedAnswers([...selectedAnswers, id]);
    }
  };

  const handleBulkGrade = () => {
    if (!bulkMarks || selectedAnswers.length === 0) {
      alert('Please select answers and enter marks');
      return;
    }

    bulkGradeMutation.mutate({
      marks_awarded: parseFloat(bulkMarks),
      feedback: bulkFeedback,
      rubric_id: selectedRubric || null,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/grading/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Grading</h1>
          <p className="text-gray-600 mt-1">
            Grade multiple submissions at once with the same marks and feedback
          </p>
        </div>
      </div>

      {/* Bulk Grading Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Grading Details ({selectedAnswers.length} selected)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marks to Award <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={bulkMarks}
              onChange={(e) => setBulkMarks(e.target.value)}
              placeholder="Enter marks"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rubric (Optional)
            </label>
            <select
              value={selectedRubric}
              onChange={(e) => setSelectedRubric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">No Rubric</option>
              {rubrics.map((rubric) => (
                <option key={rubric.id} value={rubric.id}>
                  {rubric.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback (applies to all)
            </label>
            <textarea
              value={bulkFeedback}
              onChange={(e) => setBulkFeedback(e.target.value)}
              rows={4}
              placeholder="This feedback will be added to all selected submissions..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            onClick={handleBulkGrade}
            disabled={selectedAnswers.length === 0 || !bulkMarks || bulkGradeMutation.isPending}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {bulkGradeMutation.isPending 
              ? 'Grading...' 
              : `Grade ${selectedAnswers.length} Submission(s)`
            }
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Select Submissions to Grade
            </h3>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedAnswers.length === pendingAnswers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingAnswers.map((answer) => (
              <div
                key={answer.id}
                className={`p-6 cursor-pointer transition-colors ${
                  selectedAnswers.includes(answer.id) ? 'bg-teal-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleToggleAnswer(answer.id)}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedAnswers.includes(answer.id)}
                    onChange={() => handleToggleAnswer(answer.id)}
                    className="mt-1 h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {answer.exam_attempt?.user?.name}
                      </h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {answer.question?.type?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Exam:</strong> {answer.exam_attempt?.exam?.title}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Max Marks:</strong> {answer.exam_question?.marks}
                      </span>
                      <span>
                        <strong>Submitted:</strong> {new Date(answer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}