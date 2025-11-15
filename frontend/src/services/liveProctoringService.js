import api from '../config/api';

const liveProctoringService = {
  // Get live sessions for an exam
  getLiveSessions: async (examId) => {
    const response = await api.get(`/v1/exams/${examId}/live-sessions`);
    return response.data;
  },

  // Get detailed session info
  getSessionDetails: async (attemptId) => {
    const response = await api.get(`/v1/live-sessions/${attemptId}`);
    return response.data;
  },

  // Send heartbeat (student)
  sendHeartbeat: async (attemptId, currentQuestionIndex) => {
    const response = await api.post(`/v1/exam-attempts/${attemptId}/heartbeat`, {
      current_question_index: currentQuestionIndex,
    });
    return response.data;
  },

  // Log proctoring event (student)
  logEvent: async (attemptId, eventType, description, metadata = {}, severity = 1) => {
    const response = await api.post(`/v1/exam-attempts/${attemptId}/log-event`, {
      event_type: eventType,
      description,
      metadata,
      severity,
    });
    return response.data;
  },

  // Flag student (supervisor)
  flagStudent: async (attemptId, reason) => {
    const response = await api.post(`/v1/live-sessions/${attemptId}/flag`, {
      reason,
    });
    return response.data;
  },

  // Terminate exam (supervisor)
  terminateExam: async (attemptId, reason) => {
    const response = await api.post(`/v1/live-sessions/${attemptId}/terminate`, {
      reason,
    });
    return response.data;
  },
};

export default liveProctoringService;