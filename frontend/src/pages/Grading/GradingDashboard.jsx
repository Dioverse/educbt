import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ClipboardCheck,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import gradingService from '../../services/gradingService';
import examService from '../../services/examService';

export default function GradingDashboard() {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['grading-statistics', selectedExam],
    queryFn: () => gradingService.getStatistics(selectedExam || null),
  });

  // Fetch pending grading
  const { data: pendingData, isLoading } = useQuery({
    queryKey: ['pending-grading', selectedExam],
    queryFn: () => gradingService.getPendingGrading(selectedExam || null),
  });

  // Fetch exams for filter
  const { data: examsData } = useQuery({
    queryKey: ['exams-list'],
    queryFn: () => examService.getExams({ status: 'active' }),
  });

  const pendingAnswers = pendingData?.data || [];
  const stats = statsData?.data || {
    pending_count: 0,
    graded_count: 0,
    published_count: 0,
  };

  const filteredAnswers = pendingAnswers.filter(answer => {
    if (!searchQuery) return true;
    const student = answer.exam_attempt?.user?.name || '';
    const exam = answer.exam_attempt?.exam?.title || '';
    return student.toLowerCase().includes(searchQuery.toLowerCase()) ||
           exam.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grading Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Review and grade student submissions
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Grading</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pending_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.graded_count}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ClipboardCheck className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Results Published</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.published_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Exams</option>
            {examsData?.data?.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate('/grading/rubrics')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={20} />
            Manage Rubrics
          </button>
        </div>
      </div>

      {/* Pending Answers List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Submissions ({filteredAnswers.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        ) : filteredAnswers.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No pending submissions</p>
            <p className="text-sm text-gray-500">
              All submissions have been graded
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAnswers.map((answer) => (
              <div
                key={answer.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/grading/answer/${answer.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {answer.exam_attempt?.user?.name || 'Unknown Student'}
                      </h3>
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                        {answer.question?.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Pending
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Exam:</strong> {answer.exam_attempt?.exam?.title}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {answer.exam_question?.display_order && (
                        <span>
                          <strong>Question #{answer.exam_question.display_order}:</strong>
                        </span>
                      )}
                      <span>
                        {answer.question?.question_text?.substring(0, 100).replace(/<[^>]*>/g, '')}...
                      </span>
                      <span>
                        <strong>Max Marks:</strong> {answer.exam_question?.marks}
                      </span>
                      <span>
                        <strong>Submitted:</strong> {new Date(answer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/grading/answer/${answer.id}`);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Grade Now
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