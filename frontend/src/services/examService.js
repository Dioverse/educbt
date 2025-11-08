import api from '../config/api';

const examService = {
  // Get all exams with filters
  getExams: async (params = {}) => {
    const response = await api.get('/v1/exams', { params });
    return response.data;
  },

  // Get single exam
  getExam: async (id) => {
    const response = await api.get(`/v1/exams/${id}`);
    return response.data;
  },

  // Create exam
  createExam: async (data) => {
    const response = await api.post('/v1/exams', data);
    return response.data;
  },

  // Update exam
  updateExam: async (id, data) => {
    const response = await api.put(`/v1/exams/${id}`, data);
    return response.data;
  },

  // Delete exam
  deleteExam: async (id) => {
    const response = await api.delete(`/v1/exams/${id}`);
    return response.data;
  },

  // Duplicate exam
  duplicateExam: async (id) => {
    const response = await api.post(`/v1/exams/${id}/duplicate`);
    return response.data;
  },

  // Publish exam
  publishExam: async (id) => {
    const response = await api.post(`/v1/exams/${id}/publish`);
    return response.data;
  },

  // Activate exam
  activateExam: async (id) => {
    const response = await api.post(`/v1/exams/${id}/activate`);
    return response.data;
  },

  // Archive exam
  archiveExam: async (id) => {
    const response = await api.post(`/v1/exams/${id}/archive`);
    return response.data;
  },

  // Add questions to exam
  addQuestions: async (examId, questionIds, sectionId = null) => {
    const response = await api.post(`/v1/exams/${examId}/questions`, {
      question_ids: questionIds,
      section_id: sectionId,
    });
    return response.data;
  },

  // Remove question from exam
  removeQuestion: async (examId, examQuestionId) => {
    const response = await api.delete(`/v1/exams/${examId}/questions/${examQuestionId}`);
    return response.data;
  },

  // Reorder questions
  reorderQuestions: async (examId, questionOrder) => {
    const response = await api.post(`/v1/exams/${examId}/questions/reorder`, {
      question_order: questionOrder,
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/v1/exams/statistics');
    return response.data;
  },

  // Get upcoming exams
  getUpcoming: async (limit = 10) => {
    const response = await api.get('/v1/exams/upcoming', { params: { limit } });
    return response.data;
  },

  // Get ongoing exams
  getOngoing: async () => {
    const response = await api.get('/v1/exams/ongoing');
    return response.data;
  },
};

export default examService;