import api from '../config/api';

const subjectService = {
  // Fetch all subjects
  getSubjects: async (params = {}) => {
    const response = await api.get('/v1/subjects', { params });
    return response.data;
  },

  // Fetch a single subject by ID
  getSubjectById: async (id) => {
    const response = await api.get(`/v1/subjects/${id}`);
    return response.data;
  },

  // Create a new subject
  createSubject: async (subjectData) => {
    const response = await api.post('/v1/subjects', subjectData);
    return response.data;
  },

  // Update an existing subject
  updateSubject: async (id, subjectData) => {
    const response = await api.put(`/v1/subjects/${id}`, subjectData);
    return response.data;
  },

  // Delete a subject
  deleteSubject: async (id) => {
    const response = await api.delete(`/v1/subjects/${id}`);
    return response.data;
  },
};

export default subjectService;