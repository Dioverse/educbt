import { create } from 'zustand';

const useSubjectStore = create((set) => ({
  subjects: [],
  loading: false,
  error: null,

  setSubjects: (subjects) => set({ subjects }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useSubjectStore;