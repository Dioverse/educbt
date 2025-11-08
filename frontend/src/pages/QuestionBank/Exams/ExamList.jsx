import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Users,
  FileText,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Eye,
  Play,
  Archive,
  Upload as Publish,
} from 'lucide-react';
import examService from '../../services/examService';
import useExamStore from '../../store/examStore';
import ExamCard from '../../components/Exams/ExamCard';
import ExamFilters from '../../components/Exams/ExamFilters';
import Pagination from '../../components/Common/Pagination';
import ConfirmDialog from '../../components/Common/ConfirmDialog';

export default function ExamList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    filters,
    currentPage,
    setExams,
    setPagination,
    setFilters,
    resetExamFormData,
  } = useExamStore();

  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // Fetch exams
  const { data, isLoading, error } = useQuery({
    queryKey: ['exams', filters, currentPage],
    queryFn: () => examService.getExams({
      ...filters,
      page: currentPage,
      per_page: 15,
    }),
  });

  useEffect(() => {
    if (data?.data) {
      setExams(data.data);
      setPagination(data.meta);
    }
  }, [data]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      setDeleteConfirm(false);
      setExamToDelete(null);
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: examService.duplicateExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: examService.publishExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: examService.activateExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: examService.archiveExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
    },
  });

  const handleSearch = (searchTerm) => {
    setFilters({ search: searchTerm });
  };

  const handleDelete = (id) => {
    setExamToDelete(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (examToDelete) {
      deleteMutation.mutate(examToDelete);
    }
  };

  const handleDuplicate = (id) => {
    duplicateMutation.mutate(id);
  };

  const handlePublish = (id) => {
    publishMutation.mutate(id);
  };

  const handleActivate = (id) => {
    activateMutation.mutate(id);
  };

  const handleArchive = (id) => {
    archiveMutation.mutate(id);
  };

  const handleEdit = (id) => {
    navigate(`/exams/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/exams/${id}`);
  };

  const handleCreateNew = () => {
    resetExamFormData();
    navigate('/exams/create');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your exams
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Exam
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.meta?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Play className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search exams..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <ExamFilters onClose={() => setShowFilters(false)} />
        )}
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading exams...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading exams</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No exams found</p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Exam
            </button>
          </div>
        ) : (
          <>
            {data?.data?.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onView={handleView}
                onPublish={handlePublish}
                onActivate={handleActivate}
                onArchive={handleArchive}
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
        title="Delete Exam"
        message="Are you sure you want to delete this exam? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
}