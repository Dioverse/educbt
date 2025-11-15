import api from '../config/api';

const resultService = {
  // Get results for a specific exam
  getExamResults: async (examId, params = {}) => {
    const response = await api.get(`/v1/exams/${examId}/results`, { params });
    return response.data;
  },

  // Get detailed result for a specific attempt
  getAttemptResult: async (attemptId) => {
    const response = await api.get(`/v1/results/attempts/${attemptId}`);
    return response.data;
  },

  // Get student's own results
  getMyResults: async () => {
    const response = await api.get('/v1/results/my-results');
    return response.data;
  },

  // Export exam results to Excel
  exportExamResults: async (examId) => {
    const response = await api.get(`/v1/exams/${examId}/results/export`, {
      responseType: 'blob', // Important for file download
    });
    return response.data;
  },

  // Get result statistics
  getResultStatistics: async (examId) => {
    const response = await api.get(`/v1/exams/${examId}/results/statistics`);
    return response.data;
  },

  // Publish/unpublish results
  publishResults: async (examId, attemptIds) => {
    const response = await api.post(`/v1/exams/${examId}/results/publish`, {
      attempt_ids: attemptIds,
    });
    return response.data;
  },

  unpublishResults: async (examId, attemptIds) => {
    const response = await api.post(`/v1/exams/${examId}/results/unpublish`, {
      attempt_ids: attemptIds,
    });
    return response.data;
  },
};

export default resultService;