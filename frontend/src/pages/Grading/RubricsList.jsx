import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  CheckCircle,
  MoreVertical,
} from 'lucide-react';
import rubricService from '../../services/rubricService';
import ConfirmDialog from '../../components/Common/ConfirmDialog';

export default function RubricsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rubricToDelete, setRubricToDelete] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  // Fetch rubrics
  const { data: rubricsData, isLoading } = useQuery({
    queryKey: ['rubrics'],
    queryFn: rubricService.getRubrics,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: rubricService.deleteRubric,
    onSuccess: () => {
      queryClient.invalidateQueries(['rubrics']);
      setShowDeleteConfirm(false);
      setRubricToDelete(null);
    },
  });

  const rubrics = rubricsData?.data || [];

  const handleDelete = (id) => {
    setRubricToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (rubricToDelete) {
      deleteMutation.mutate(rubricToDelete);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grading Rubrics</h1>
          <p className="text-gray-600 mt-1">
            Create and manage grading criteria for consistent evaluation
          </p>
        </div>
        <button
          onClick={() => navigate('/grading/rubrics/create')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Rubric
        </button>
      </div>

      {/* Rubrics List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading rubrics...</p>
          </div>
        ) : rubrics.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No rubrics created yet</p>
            <button
              onClick={() => navigate('/grading/rubrics/create')}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Create Your First Rubric
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rubrics.map((rubric) => (
              <div
                key={rubric.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {rubric.name}
                      </h3>
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded">
                        {rubric.question_type.replace(/_/g, ' ')}
                      </span>
                      {rubric.is_default && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                          <CheckCircle size={12} />
                          Default
                        </span>
                      )}
                    </div>

                    {rubric.description && (
                      <p className="text-gray-600 mb-3">{rubric.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Max Score:</strong> {rubric.max_score}
                      </span>
                      <span>
                        <strong>Criteria:</strong> {rubric.criteria?.length || 0}
                      </span>
                      {rubric.subject && (
                        <span>
                          <strong>Subject:</strong> {rubric.subject.name}
                        </span>
                      )}
                      <span>
                        <strong>Created by:</strong> {rubric.creator?.name}
                      </span>
                    </div>

                    {/* Criteria Preview */}
                    {rubric.criteria && rubric.criteria.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Criteria:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {rubric.criteria.map((criterion) => (
                            <div key={criterion.id} className="text-sm text-gray-600">
                              • {criterion.criterion_name} ({criterion.max_points} pts)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === rubric.id ? null : rubric.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {showMenu === rubric.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            navigate(`/grading/rubrics/${rubric.id}/edit`);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            // Duplicate functionality
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy size={16} />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(rubric.id);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Rubric"
        message="Are you sure you want to delete this rubric? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
}