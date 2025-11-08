import { create } from 'zustand';

const useQuestionStore = create((set) => ({
  // Questions list
  questions: [],
  currentQuestion: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  perPage: 15,
  total: 0,

  // Filters
  filters: {
    search: '',
    type: '',
    difficulty: '',
    subject_id: '',
    topic_id: '',
    is_active: '',
    is_verified: '',
    tags: [],
    sort_by: 'created_at',
    sort_order: 'desc',
  },

  // Loading states
  loading: false,
  error: null,

  // Selected questions for bulk operations
  selectedQuestions: [],

  // Actions
  setQuestions: (questions) => set({ questions }),
  
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  setPagination: (pagination) => set({
    currentPage: pagination.current_page,
    totalPages: pagination.last_page,
    perPage: pagination.per_page,
    total: pagination.total,
  }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  resetFilters: () => set({
    filters: {
      search: '',
      type: '',
      difficulty: '',
      subject_id: '',
      topic_id: '',
      is_active: '',
      is_verified: '',
      tags: [],
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  }),

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Selected questions management
  selectQuestion: (id) => set((state) => ({
    selectedQuestions: [...state.selectedQuestions, id],
  })),

  deselectQuestion: (id) => set((state) => ({
    selectedQuestions: state.selectedQuestions.filter((qId) => qId !== id),
  })),

  toggleSelectQuestion: (id) => set((state) => ({
    selectedQuestions: state.selectedQuestions.includes(id)
      ? state.selectedQuestions.filter((qId) => qId !== id)
      : [...state.selectedQuestions, id],
  })),

  selectAllQuestions: () => set((state) => ({
    selectedQuestions: state.questions.map((q) => q.id),
  })),

  deselectAllQuestions: () => set({ selectedQuestions: [] }),

  clearSelectedQuestions: () => set({ selectedQuestions: [] }),
}));

export default useQuestionStore;