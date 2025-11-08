import api from '../config/api';

const questionService = {
  // Get all questions with filters
  getQuestions: async (params = {}) => {
    const response = await api.get('/v1/questions', { params });
    return response.data;
  },

  // Get single question
  getQuestion: async (id) => {
    const response = await api.get(`/v1/questions/${id}`);
    return response.data;
  },

  // Create question
  createQuestion: async (data) => {
    const response = await api.post('/v1/questions', data);
    return response.data;
  },

  // Update question
  updateQuestion: async (id, data) => {
    const response = await api.put(`/v1/questions/${id}`, data);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/v1/questions/${id}`);
    return response.data;
  },

  // Duplicate question
  duplicateQuestion: async (id) => {
    const response = await api.post(`/v1/questions/${id}/duplicate`);
    return response.data;
  },

  // Verify question
  verifyQuestion: async (id) => {
    const response = await api.post(`/v1/questions/${id}/verify`);
    return response.data;
  },

  // Unverify question
  unverifyQuestion: async (id) => {
    const response = await api.post(`/v1/questions/${id}/unverify`);
    return response.data;
  },

  // Toggle active
  toggleActive: async (id) => {
    const response = await api.post(`/v1/questions/${id}/toggle-active`);
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (ids) => {
    const response = await api.post('/v1/questions/bulk-delete', { ids });
    return response.data;
  },

  // Bulk update tags
  bulkUpdateTags: async (ids, tags, action) => {
    const response = await api.post('/v1/questions/bulk-update-tags', {
      ids,
      tags,
      action,
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/v1/questions/statistics');
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (formData) => {
    const response = await api.post('/v1/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (id) => {
    const response = await api.delete(`/v1/media/attachments/${id}`);
    return response.data;
  },
};

export default questionService;