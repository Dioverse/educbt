import api from './api';

const adminAnalyticsService = {
  /**
   * Get dashboard analytics
   */
  getDashboardAnalytics: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  /**
   * Get user growth statistics
   */
  getUserGrowth: async (days = 30) => {
    const response = await api.get('/analytics/user-growth', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get exam performance statistics
   */
  getExamPerformance: async (examId = null) => {
    const response = await api.get('/analytics/exam-performance', {
      params: examId ? { exam_id: examId } : {}
    });
    return response.data;
  },
  /**
   * Get recent activity with pagination and filters
   */
  getRecentActivity: async (params = {}) => {
    const response = await api.get('/analytics/recent-activity', {
      params: {
        page: params.page || 1,
        per_page: params.perPage || 15,
        search: params.search || '',
        type: params.type || 'all',
        days: params.days || 7,
      }
    });
    return response.data;
  },
};

export default adminAnalyticsService;