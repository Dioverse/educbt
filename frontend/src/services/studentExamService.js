import api from '../config/api';

const studentExamService = {
  // Get available exams
  getAvailableExams: async () => {
    const response = await api.get('/v1/student/exams');
    return response.data;
  },

  // Get my attempts
  getMyAttempts: async () => {
    const response = await api.get('/v1/student/my-attempts');
    return response.data;
  },

  // Get exam details (for pre-exam screen)
  getExamDetails: async (examId) => {
    const response = await api.get(`/v1/student/exams/${examId}`);
    return response.data;
  },

  // Start exam
  startExam: async (examId, selfieFile = null) => {
    const formData = new FormData();
    if (selfieFile) {
      formData.append('selfie', selfieFile);
    }

    const response = await api.post(`/v1/student/exams/${examId}/start`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get attempt details
  getAttempt: async (attemptId) => {
    const response = await api.get(`/v1/student/attempts/${attemptId}`);
    return response.data;
  },

  // Save answer
  saveAnswer: async (attemptId, answerData) => {
    const response = await api.post(`/v1/student/attempts/${attemptId}/answer`, answerData);
    return response.data;
  },

  // Submit exam
  submitExam: async (attemptId) => {
    const response = await api.post(`/v1/student/attempts/${attemptId}/submit`);
    return response.data;
  },

  // Get result
  getResult: async (attemptId) => {
    const response = await api.get(`/v1/student/attempts/${attemptId}/result`);
    return response.data;
  },
};

export default studentExamService;