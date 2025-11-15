import api from '../config/api';

const rubricService = {
  // Get all rubrics
  getRubrics: async (params = {}) => {
    const response = await api.get('/v1/rubrics', { params });
    return response.data;
  },

  // Get single rubric
  getRubric: async (id) => {
    const response = await api.get(`/v1/rubrics/${id}`);
    return response.data;
  },

  // Create rubric
  createRubric: async (data) => {
    const response = await api.post('/v1/rubrics', data);
    return response.data;
  },

  // Update rubric
  updateRubric: async (id, data) => {
    const response = await api.put(`/v1/rubrics/${id}`, data);
    return response.data;
  },

  // Delete rubric
  deleteRubric: async (id) => {
    const response = await api.delete(`/v1/rubrics/${id}`);
    return response.data;
  },
};

export default rubricService;