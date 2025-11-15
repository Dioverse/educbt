import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  FileText,
  Download,
} from 'lucide-react';
import examService from '../../services/examService';
import resultService from '../../services/resultService';
import useExamStore from '../../store/examStore';

export default function ExamList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setExams, setPagination } = useExamStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [downloadingExamId, setDownloadingExamId] = useState(null);

  // Fetch exams - fetch ALL exams first, then filter by status
  const { data: examsData, isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examService.getExams(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    },
  });

  // Update store when data changes
  useEffect(() => {
    if (examsData?.data) {
      setExams(examsData.data);
      if (examsData.pagination) {
        setPagination(examsData.pagination);
      } else {
        setPagination(null);
      }
    }
  }, [examsData, setExams, setPagination]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewResults = (examId) => {
    navigate(`/exams/${examId}/results`);
  };

  const handleDownloadExcel = async (examId, examTitle) => {
    try {
      setDownloadingExamId(examId);
      
      // Call the export service
      const blob = await resultService.exportExamResults(examId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Format filename: "Exam_Title_Results_2024-01-15.xlsx"
      const date = new Date().toISOString().split('T')[0];
      const filename = `${examTitle.replace(/[^a-z0-9]/gi, '_')}_Results_${date}.xlsx`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download results. Please try again.');
    } finally {
      setDownloadingExamId(null);
    }
  };

  // Filter exams based on search AND status
  const filteredExams = examsData?.data?.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-1">Manage your exams and assessments</p>
        </div>
        <button
          onClick={() => navigate('/exams/create')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Exam
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No exams found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {exam.title}
                        </div>
                        {exam.description && (
                          <div className="text-sm text-gray-500">
                            {exam.description.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {exam.subject?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {exam.duration_minutes} min
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {exam.questions?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/exams/${exam.id}`)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                          title="View Exam"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <button
                          onClick={() => navigate(`/exams/${exam.id}/edit`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Edit Exam"
                        >
                          <Edit size={18} />
                        </button>
                        
                        {exam.status === 'active' && (
                          <button
                            onClick={() => navigate(`/proctoring/live/${exam.id}`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Live Monitoring"
                          >
                            <Eye size={18} />
                          </button>
                        )}

                        {/* View Results Button */}
                        <button
                          onClick={() => handleViewResults(exam.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Results"
                        >
                          <FileText size={18} />
                        </button>

                        {/* Download Excel Button */}
                        <button
                          onClick={() => handleDownloadExcel(exam.id, exam.title)}
                          disabled={downloadingExamId === exam.id}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-50"
                          title="Download Results as Excel"
                        >
                          {downloadingExamId === exam.id ? (
                            <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-teal-600"></div>
                          ) : (
                            <Download size={18} />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Exam"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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