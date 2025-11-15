import { create } from 'zustand';

const useExamStore = create((set) => ({
  // Exams list
  exams: [],
  currentExam: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  perPage: 15,
  total: 0,

  // Filters
  filters: {
    search: '',
    status: '',
    subject_id: '',
    grade_level_id: '',
    is_scheduled: '',
    date_filter: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  },

  // Loading states
  loading: false,
  error: null,

  // Form data for multi-step creation
  examFormData: {
    // Step 1: Basic Info
    title: '',
    description: '',
    instructions: '',
    subject_id: '',
    grade_level_id: '',
    
    // Step 2: Timing & Schedule
    duration_minutes: 60,
    is_scheduled: false,
    start_datetime: '',
    end_datetime: '',
    time_per_question_seconds: null,
    
    // Step 3: Questions & Sections
    sections: [],
    questions: [],
    randomize_questions: false,
    randomize_options: false,
    questions_per_page: 1,
    
    // Step 4: Configuration
    max_attempts: 1,
    allow_resume: true,
    auto_save_interval_seconds: 30,
    pass_marks: 0,
    enable_negative_marking: false,
    
    // Step 5: Results & Proctoring
    result_display: 'scheduled',
    result_publish_datetime: '',
    show_correct_answers: false,
    show_score_breakdown: true,
    allow_review_after_submit: false,
    require_selfie: false,
    enable_tab_switch_detection: true,
    lock_fullscreen: false,
    max_tab_switches_allowed: 3,
    
    // Eligibility & Access
    is_public: false,
    access_code: '',
    eligibility: [],
    supervisors: [],
  },

  currentStep: 1,
  totalSteps: 5,

  // Actions
  setExams: (exams) => set({ exams }),
  
  setCurrentExam: (exam) => set({ currentExam: exam }),
  
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
      status: '',
      subject_id: '',
      grade_level_id: '',
      is_scheduled: '',
      date_filter: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    },
  }),

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Form data management
  updateExamFormData: (data) => set((state) => ({
    examFormData: { ...state.examFormData, ...data },
  })),

  resetExamFormData: () => set({
    examFormData: {
      title: '',
      description: '',
      instructions: '',
      subject_id: '',
      grade_level_id: '',
      duration_minutes: 60,
      is_scheduled: false,
      start_datetime: '',
      end_datetime: '',
      time_per_question_seconds: null,
      sections: [],
      questions: [],
      randomize_questions: false,
      randomize_options: false,
      questions_per_page: 1,
      max_attempts: 1,
      allow_resume: true,
      auto_save_interval_seconds: 30,
      pass_marks: 0,
      enable_negative_marking: false,
      result_display: 'scheduled',
      result_publish_datetime: '',
      show_correct_answers: false,
      show_score_breakdown: true,
      allow_review_after_submit: false,
      require_selfie: false,
      enable_tab_switch_detection: true,
      lock_fullscreen: false,
      max_tab_switches_allowed: 3,
      is_public: false,
      access_code: '',
      eligibility: [],
      supervisors: [],
    },
    currentStep: 1,
  }),

  // Step navigation
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps),
  })),
  
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1),
  })),
}));

export default useExamStore;