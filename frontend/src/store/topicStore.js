import { create } from 'zustand';

const useTopicStore = create((set) => ({
  topics: [],
  loading: false,
  error: null,

  setTopics: (topics) => set({ topics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useTopicStore;