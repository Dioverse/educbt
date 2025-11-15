import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Upload,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../config/api';

export default function UserManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'student');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Fetch users by role with pagination
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', selectedRole, page, perPage, searchQuery],
    queryFn: () => api.get(`/v1/users/role/${selectedRole}`, {
      params: {
        page,
        per_page: perPage,
        search: searchQuery,
      }
    }).then(res => res.data),
    keepPreviousData: true,
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (userId) => api.patch(`/v1/users/${userId}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries(['users', selectedRole]);
    },
  });

  const users = usersData?.data?.users || usersData?.data || [];
  const pagination = usersData?.data?.pagination || null;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
    setPage(1); // Reset to first page
    setSearchQuery('');
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handlePerPageChange = (value) => {
    setPerPage(parseInt(value));
    setPage(1); // Reset to first page
  };

  const handleToggleStatus = (userId) => {
    if (confirm('Are you sure you want to change this user\'s status?')) {
      toggleStatusMutation.mutate(userId);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-green-100 text-green-800',
      student: 'bg-teal-100 text-teal-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all system users
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/users/import-students')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Upload size={20} />
            Import Students
          </button>
          <button
            onClick={() => navigate('/admin/users/import-supervisors')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Upload size={20} />
            Import Supervisors
          </button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleRoleChange('student')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRole === 'student'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => handleRoleChange('supervisor')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRole === 'supervisor'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Supervisors
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRole === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}s
            {pagination && ` (${pagination.total})`}
          </h2>
          {pagination && (
            <span className="text-sm text-gray-600">
              Showing {pagination.from} to {pagination.to} of {pagination.total} users
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {searchQuery ? 'No users found matching your search' : `No ${selectedRole}s found`}
            </p>
            {!searchQuery && (
              <>
                {selectedRole === 'student' && (
                  <button
                    onClick={() => navigate('/admin/users/import-students')}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Import Students
                  </button>
                )}
                {selectedRole === 'supervisor' && (
                  <button
                    onClick={() => navigate('/admin/users/import-supervisors')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Import Supervisors
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            selectedRole === 'student' ? 'bg-teal-100' :
                            selectedRole === 'supervisor' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            <span className={`font-medium ${
                              selectedRole === 'student' ? 'text-teal-600' :
                              selectedRole === 'supervisor' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {user.student_id || user.staff_id || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={14} className="mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle size={14} className="mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={toggleStatusMutation.isPending}
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${
                            user.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                        >
                          {user.is_active ? (
                            <>
                              <EyeOff size={14} className="mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye size={14} className="mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} users
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {/* First page */}
                      {page > 3 && (
                        <>
                          <button
                            onClick={() => setPage(1)}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            1
                          </button>
                          {page > 4 && <span className="px-2 text-gray-500">...</span>}
                        </>
                      )}

                      {/* Pages around current */}
                      {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                        .filter(p => p >= page - 2 && p <= page + 2)
                        .map(p => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-2 border rounded-lg ${
                              p === page
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}

                      {/* Last page */}
                      {page < pagination.last_page - 2 && (
                        <>
                          {page < pagination.last_page - 3 && <span className="px-2 text-gray-500">...</span>}
                          <button
                            onClick={() => setPage(pagination.last_page)}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            {pagination.last_page}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.last_page}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}