import api from '../config/api';

const questionImportExportService = {
  // Import questions
  importQuestions: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/v1/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export questions
  exportQuestions: async ( questionIds = []) => {
    const response = await api.post('/v1/questions/export', {
      question_ids: questionIds,
    });
    return response.data;
  },

  // Download template
  downloadTemplate: async () => {
    const response = await api.get('/v1/questions/template');
    return response.data;
  },
};

export default questionImportExportService;