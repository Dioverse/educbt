import api from '../config/api';

const resultsExportService = {
  // Export exam results
  exportResults: async (examId, format) => {
    const response = await api.post(`/v1/exams/${examId}/export-results`, {
      format,
    });
    return response.data;
  },
};

export default resultsExportService;