import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';
import resultService from '../../services/resultService';
import examService from '../../services/examService';

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  // Fetch exam details
  const { data: examData } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExam(examId),
  });

  // Fetch results
  const { data: resultsData, isLoading, error } = useQuery({
    queryKey: ['exam-results', examId],
    queryFn: () => resultService.getExamResults(examId),
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['result-statistics', examId],
    queryFn: () => resultService.getResultStatistics(examId),
  });

  const exam = examData?.data;
  const allResults = resultsData?.data || [];
  
  // Filter by published status
  const results = showPublishedOnly 
    ? allResults.filter(r => r.is_published) 
    : allResults;
    
  const stats = statsData?.data || {
    total_attempts: 0,
    average_score: 0,
    pass_rate: 0,
    highest_score: 0,
  };

  // Helper function to safely format numbers
  const formatNumber = (value, decimals = 1) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.0' : num.toFixed(decimals);
  };

  // Filter results by search
  const filteredResults = results.filter((result) => {
    if (!searchQuery) return true;
    const studentName = result.user?.name || '';
    const studentEmail = result.user?.email || '';
    const query = searchQuery.toLowerCase();
    return studentName.toLowerCase().includes(query) || 
           studentEmail.toLowerCase().includes(query);
  });

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      const blob = await resultService.exportExamResults(examId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `${exam?.title?.replace(/[^a-z0-9]/gi, '_') || 'Exam'}_Results_${date}.xlsx`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download results. Please try again.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleViewDetails = (attemptId) => {
    navigate(`/results/attempt/${attemptId}`);
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-50',
      'A': 'text-green-600 bg-green-50',
      'B+': 'text-blue-600 bg-blue-50',
      'B': 'text-blue-600 bg-blue-50',
      'C': 'text-yellow-600 bg-yellow-50',
      'D': 'text-orange-600 bg-orange-50',
      'F': 'text-red-600 bg-red-50',
    };
    return colors[grade] || 'text-gray-600 bg-gray-50';
  };

  const getPassStatusColor = (status) => {
    return status === 'pass' 
      ? 'text-green-600 bg-green-50' 
      : 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/exams')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {exam?.title || 'Exam'} - Results
            </h1>
            <p className="text-gray-600 mt-1">
              View and analyze student performance
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadExcel}
          disabled={downloadingExcel || allResults.length === 0}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
        >
          {downloadingExcel ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Download Excel</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load results</p>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900">
                {allResults.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.average_score)}%
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
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.pass_rate)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.highest_score)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showPublishedOnly}
              onChange={(e) => setShowPublishedOnly(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Published Only</span>
          </label>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Student Results ({filteredResults.length})
            {!showPublishedOnly && allResults.some(r => !r.is_published) && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Including unpublished)
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {searchQuery ? 'No results match your search' : 'No results found'}
            </p>
            <p className="text-sm text-gray-500">
              {searchQuery 
                ? 'Try a different search term' 
                : "Students haven't completed this exam yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.user?.email || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.marks_obtained ?? 0} / {result.total_marks ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatNumber(result.percentage)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${getGradeColor(result.grade)}`}>
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded flex items-center gap-1 w-fit ${getPassStatusColor(result.pass_status)}`}>
                        {result.pass_status === 'pass' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {result.pass_status === 'pass' ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {result.is_published ? (
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.time_taken_seconds 
                        ? `${Math.floor(result.time_taken_seconds / 60)} min` 
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.created_at 
                        ? new Date(result.created_at).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(result.exam_attempt_id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}