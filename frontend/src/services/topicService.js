export default topicService = {
    // Fetch all topics
    getTopics: async (subjectId) => {
        const response = await api.get('/v1/topics', {
            params: { subject_id: subjectId },
        });
        return response.data;
    },

    // Fetch a single topic by ID
    getTopicById: async (id) => {
        const response = await api.get(`/v1/topics/${id}`);
        return response.data;
    },

    // Create a new topic
    createTopic: async (topicData) => {
        const response = await api.post('/v1/topics', topicData);
        return response.data;
    },

    // Update an existing topic
    updateTopic: async (id, topicData) => {
        const response = await api.put(`/v1/topics/${id}`, topicData);
        return response.data;
    },

    // Delete a topic
    deleteTopic: async (id) => {
        const response = await api.delete(`/v1/topics/${id}`);
        return response.data;
    },
};