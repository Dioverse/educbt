import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import questionService from '../../services/questionService';
import useQuestionStore from '../../store/questionStore';
import QuestionFilters from '../../components/QuestionBank/QuestionFilters';
import QuestionCard from '../../components/QuestionBank/QuestionCard';
import Pagination from '../../components/Common/Pagination';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import questionImportExportService from '../../services/questionImportExportService';

export default function QuestionList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const exportMutation = useMutation({
    mutationFn: ({ ids }) => questionImportExportService.exportQuestions('excel', ids),
    onSuccess: (data) => {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.data.download_url;
      link.download = data.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });
  
  const {
    filters,
    currentPage,
    selectedQuestions,
    setQuestions,
    setPagination,
    setFilters,
    clearSelectedQuestions,
  } = useQuestionStore();

  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', filters, currentPage],
    queryFn: () => questionService.getQuestions({
      ...filters,
      page: currentPage,
      per_page: 15,
    }),
  });

  useEffect(() => {
    if (data?.data) {
      setQuestions(data.data);
      setPagination(data.meta);
    }
  }, [data]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: questionService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      setDeleteConfirm(false);
      setQuestionToDelete(null);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: questionService.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      clearSelectedQuestions();
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: questionService.duplicateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
    },
  });

  const handleSearch = (searchTerm) => {
    setFilters({ search: searchTerm });
  };

  const handleDelete = (id) => {
    setQuestionToDelete(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteMutation.mutate(questionToDelete);
    }
  };

  const handleBulkDelete = () => {
    if (selectedQuestions.length > 0) {
      bulkDeleteMutation.mutate(selectedQuestions);
    }
  };

  const handleDuplicate = (id) => {
    duplicateMutation.mutate(id);
  };

  const handleEdit = (id) => {
    navigate(`/questions/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/questions/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">
            Manage your questions for exams
          </p>
        </div>
        <div className="flex gap-3">
        <button
          onClick={() => navigate('/questions/import')}
          className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 flex items-center gap-2"
        >
          <Upload size={20} />
          Import
        </button>
        
        <button
          onClick={() => {
            if (confirm('Export all questions to Excel?')) {
              exportMutation.mutate({ ids: [] });
            }
          }}
          disabled={exportMutation.isPending}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Download size={20} />
          {exportMutation.isPending ? 'Exporting...' : 'Export to Excel'}
        </button>

        <button
          onClick={() => navigate('/questions/create')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Question
        </button>
      </div>
      </div>

      

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <QuestionFilters onClose={() => setShowFilters(false)} />
        )}
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-teal-900 font-medium">
              {selectedQuestions.length} question(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Selected
              </button>
              <button
                onClick={clearSelectedQuestions}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading questions</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No questions found</p>
            <button
              onClick={() => navigate('/questions/create')}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Create Your First Question
            </button>
          </div>
        ) : (
          <>
            {data?.data?.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onView={handleView}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {data?.meta && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.last_page}
          onPageChange={(page) => setFilters({ page })}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
}