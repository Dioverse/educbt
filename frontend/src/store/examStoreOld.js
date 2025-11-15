import { create } from 'zustand';

const useExamStore = create((set) => ({
  exams: [],
  selectedExam: null,
  filters: {
    status: '',
    subject_id: '',
    search: '',
  },
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },

  setExams: (exams) => set({ exams }),
  
  setSelectedExam: (exam) => set({ selectedExam: exam }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setPagination: (paginationData) => {
    // Fix: Handle both paginated and non-paginated responses
    if (!paginationData) {
      set({
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        }
      });
      return;
    }

    set({
      pagination: {
        current_page: paginationData.current_page || 1,
        last_page: paginationData.last_page || 1,
        per_page: paginationData.per_page || 10,
        total: paginationData.total || 0,
      }
    });
  },
  
  clearFilters: () => set({
    filters: {
      status: '',
      subject_id: '',
      search: '',
    }
  }),
}));

export default useExamStore;