import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  BookOpen,
} from 'lucide-react';
import adminAnalyticsService from '../../services/adminAnalyticsService';

export default function RecentActivityPanel() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [days, setDays] = useState(7);

  // Fetch activity data
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['recent-activity', page, perPage, search, activityType, days],
    queryFn: () => adminAnalyticsService.getRecentActivity({
      page,
      perPage,
      search,
      type: activityType,
      days,
    }),
    keepPreviousData: true,
  });

  const activities = activityData?.data?.activities || [];
  const pagination = activityData?.data?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handlePerPageChange = (value) => {
    setPerPage(parseInt(value));
    setPage(1); // Reset to first page
  };

  const handleTypeFilter = (type) => {
    setActivityType(type);
    setPage(1);
  };

  const handleDaysFilter = (daysValue) => {
    setDays(parseInt(daysValue));
    setPage(1);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'exam_attempt':
        return <FileText size={16} className="text-blue-600" />;
      case 'user_registration':
        return <Users size={16} className="text-green-600" />;
      case 'exam_created':
        return <BookOpen size={16} className="text-purple-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-700',
      submitted: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={20} />
            Recent Activity
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Total: {pagination.total || 0} activities</span>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by user name, email, or exam title..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Clear
              </button>
            )}
          </form>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Activity Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Type:</span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'exam_attempt', label: 'Exams' },
                  { value: 'user_registration', label: 'Users' },
                  { value: 'exam_created', label: 'Created' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeFilter(type.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      activityType === type.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Days Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Period:</span>
              <select
                value={days}
                onChange={(e) => handleDaysFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="1">Today</option>
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
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
      </div>

      {/* Activity List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activities...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
            <p className="text-gray-600 font-medium">No activities found</p>
            <p className="text-gray-500 text-sm mt-1">
              {search 
                ? 'Try adjusting your search terms or filters'
                : 'Activities will appear here as users interact with the system'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="mt-1 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        {activity.user_email && (
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.user_name} • {activity.user_email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span title={formatDateTime(activity.timestamp)}>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Showing {pagination.from} to {pagination.to} of {pagination.total} activities
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
                              ? 'bg-primary-600 text-white border-primary-600'
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
            )}
          </>
        )}
      </div>
    </div>
  );
}