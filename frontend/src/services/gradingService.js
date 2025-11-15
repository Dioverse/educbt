import api from '../config/api';

const gradingService = {
  // Get pending grading
  getPendingGrading: async (examId = null) => {
    const params = examId ? { exam_id: examId } : {};
    const response = await api.get('/v1/grading/pending', { params });
    return response.data;
  },

  // Get single answer for grading
  getAnswerForGrading: async (answerId) => {
    const response = await api.get(`/v1/grading/answers/${answerId}`);
    return response.data;
  },

  // Grade single answer
  gradeAnswer: async (answerId, gradeData) => {
    const response = await api.post(`/v1/grading/answers/${answerId}/grade`, gradeData);
    return response.data;
  },

  // Bulk grade
  bulkGrade: async (answerIds, gradeData) => {
    const response = await api.post('/v1/grading/bulk-grade', {
      answer_ids: answerIds,
      ...gradeData,
    });
    return response.data;
  },

  // Publish results
  publishResults: async (attemptIds) => {
    const response = await api.post('/v1/grading/publish-results', {
      attempt_ids: attemptIds,
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async (examId = null) => {
    const params = examId ? { exam_id: examId } : {};
    const response = await api.get('/v1/grading/statistics', { params });
    return response.data;
  },
};

export default gradingService;