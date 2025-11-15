import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import gradingService from '../../services/gradingService';
import examService from '../../services/examService';

export default function PublishResults() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedAttempts, setSelectedAttempts] = useState([]);

  // Fetch exams
  const { data: examsData } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getExams,
  });

  // Fetch exam attempts (you'll need to create this endpoint)
  const { data: attemptsData, isLoading } = useQuery({
    queryKey: ['exam-attempts', selectedExam],
    queryFn: async () => {
      // This would fetch graded but unpublished attempts
      // You'll need to create this endpoint
      return { data: [] };
    },
    enabled: !!selectedExam,
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: gradingService.publishResults,
    onSuccess: () => {
      queryClient.invalidateQueries(['exam-attempts']);
      queryClient.invalidateQueries(['grading-statistics']);
      setSelectedAttempts([]);
    },
  });

  const attempts = attemptsData?.data || [];

  const handleSelectAll = () => {
    if (selectedAttempts.length === attempts.length) {
      setSelectedAttempts([]);
    } else {
      setSelectedAttempts(attempts.map(a => a.id));
    }
  };

  const handleToggleAttempt = (id) => {
    if (selectedAttempts.includes(id)) {
      setSelectedAttempts(selectedAttempts.filter(aid => aid !== id));
    } else {
      setSelectedAttempts([...selectedAttempts, id]);
    }
  };

  const handlePublish = () => {
    if (selectedAttempts.length === 0) {
      alert('Please select attempts to publish');
      return;
    }

    if (confirm(`Are you sure you want to publish results for ${selectedAttempts.length} student(s)?`)) {
      publishMutation.mutate(selectedAttempts);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/grading/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publish Results</h1>
          <p className="text-gray-600 mt-1">
            Make graded exam results visible to students
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-teal-900">
            <strong>Note:</strong> Once results are published, students will be able to view 
            their scores and feedback. Make sure all grading is complete before publishing.
          </div>
        </div>
      </div>

      {/* Exam Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Exam
        </label>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Choose an exam...</option>
          {examsData?.data?.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title}
            </option>
          ))}
        </select>
      </div>

      {/* Results List */}
      {selectedExam && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Graded Results ({selectedAttempts.length} selected)
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {selectedAttempts.length === attempts.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={selectedAttempts.length === 0 || publishMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={20} />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish Selected'}
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No graded results to publish</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className={`p-6 cursor-pointer transition-colors ${
                    selectedAttempts.includes(attempt.id) ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleAttempt(attempt.id)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedAttempts.includes(attempt.id)}
                      onChange={() => handleToggleAttempt(attempt.id)}
                      className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {attempt.user?.name}
                      </h4>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>
                          <strong>Score:</strong> {attempt.result?.marks_obtained} / {attempt.result?.total_marks}
                        </span>
                        <span>
                          <strong>Percentage:</strong> {attempt.result?.percentage?.toFixed(1)}%
                        </span>
                        <span>
                          <strong>Status:</strong>{' '}
                          <span className={attempt.result?.pass_status === 'pass' ? 'text-green-600' : 'text-red-600'}>
                            {attempt.result?.pass_status?.toUpperCase()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}