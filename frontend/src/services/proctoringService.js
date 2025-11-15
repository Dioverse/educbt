import api from '../config/api';

const proctoringService = {
  /**
   * Log proctoring event
   */
  logEvent: async (attemptId, eventType, eventData = null, severity = null) => {
    try {
      await api.post('/v1/student/proctoring/log', {
        attempt_id: attemptId,
        event_type: eventType,
        event_data: eventData,
        severity: severity,
      });
    } catch (error) {
      console.error('Failed to log proctoring event:', error);
    }
  },
};

export default proctoringService;