import { create } from 'zustand';

const initialFormData = {
  title: '',
  description: '',
  subject_id: '',
  duration_minutes: 60,
  total_marks: 0,
  pass_marks: 0,
  start_date: '',
  end_date: '',
  instructions: '',
  status: 'draft',
  questions: [],
  
  // Settings
  shuffle_questions: false,
  shuffle_options: false,
  show_results_immediately: true,
  allow_review: true,
  enable_negative_marking: false,
  max_attempts: 1,
  enable_tab_switch_detection: false,
  disable_copy_paste: false,
  lock_fullscreen: false,
  require_webcam: false,
  enable_calculator: false,
  max_tab_switches: 3,
  
  // Scheduling
  is_scheduled: false,
  start_datetime: '',
  end_datetime: '',
};



const useExamStore = create((set) => ({
  exams: [],
  selectedExam: null,
  examFormData: { ...initialFormData },
  currentStep: 1,
  totalSteps: 5,

  // examFormData: { /* initial state */ },
  
  updateExamFormData: (updates) => 
    set((state) => ({
      examFormData: { ...state.examFormData, ...updates }
    })),
  
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

  // Form actions
  setExamFormData: (data) => set((state) => ({
    examFormData: { ...state.examFormData, ...data }
  })),

  updateExamField: (field, value) => set((state) => ({
    examFormData: { ...state.examFormData, [field]: value }
  })),

  addQuestion: (question) => set((state) => {
    const questions = [...state.examFormData.questions];
    
    // Check if question already exists
    if (!questions.find(q => q.id === question.id)) {
      questions.push({
        id: question.id,
        question_id: question.id,
        marks: question.marks,
        negative_marks: question.negative_marks || 0,
        display_order: questions.length + 1,
        is_mandatory: true,
        question: question, // Store full question object for display
      });

      // Recalculate total marks
      const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

      return {
        examFormData: {
          ...state.examFormData,
          questions,
          total_marks: totalMarks,
        }
      };
    }
    return state;
  }),

  removeQuestion: (questionId) => set((state) => {
    const questions = state.examFormData.questions.filter(q => q.id !== questionId);
    
    // Recalculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return {
      examFormData: {
        ...state.examFormData,
        questions,
        total_marks: totalMarks,
      }
    };
  }),

  updateQuestionMarks: (questionId, marks, negativeMarks) => set((state) => {
    const questions = state.examFormData.questions.map(q => 
      q.id === questionId 
        ? { ...q, marks, negative_marks: negativeMarks }
        : q
    );

    // Recalculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return {
      examFormData: {
        ...state.examFormData,
        questions,
        total_marks: totalMarks,
      }
    };
  }),

  reorderQuestions: (questions) => set((state) => ({
    examFormData: {
      ...state.examFormData,
      questions: questions.map((q, index) => ({
        ...q,
        display_order: index + 1,
      })),
    }
  })),

  resetExamFormData: () => set({
    examFormData: { ...initialFormData },
    currentStep: 1,
  }),

  loadExamForEdit: (exam) => set({
    examFormData: {
      title: exam.title || '',
      description: exam.description || '',
      subject_id: exam.subject_id || '',
      duration_minutes: exam.duration_minutes || 60,
      total_marks: exam.total_marks || 0,
      pass_marks: exam.pass_marks || 0,
      start_date: exam.start_date ? exam.start_date.split('T')[0] : '',
      end_date: exam.end_date ? exam.end_date.split('T')[0] : '',
      instructions: exam.instructions || '',
      status: exam.status || 'draft',
      questions: exam.questions?.map(q => ({
        id: q.id,
        question_id: q.id,
        marks: q.marks,
        negative_marks: q.negative_marks || 0,
        display_order: q.display_order,
        is_mandatory: q.is_mandatory ?? true,
        question: q,
      })) || [],
      
      shuffle_questions: exam.shuffle_questions || false,
      shuffle_options: exam.shuffle_options || false,
      show_results_immediately: exam.show_results_immediately ?? true,
      allow_review: exam.allow_review ?? true,
      enable_negative_marking: exam.enable_negative_marking || false,
      max_attempts: exam.max_attempts || 1,
      enable_tab_switch_detection: exam.enable_tab_switch_detection || false,
      disable_copy_paste: exam.disable_copy_paste || false,
      lock_fullscreen: exam.lock_fullscreen || false,
      require_webcam: exam.require_webcam || false,
      enable_calculator: exam.enable_calculator || false,
      max_tab_switches: exam.max_tab_switches || 3,
      
      is_scheduled: !!(exam.start_date || exam.end_date),
      start_datetime: exam.start_date || '',
      end_datetime: exam.end_date || '',
    },
    currentStep: 1,
  }),

  // Step navigation
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps)
  })),
  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1)
  })),

  // List actions
  setExams: (exams) => set({ exams }),
  setSelectedExam: (exam) => set({ selectedExam: exam }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setPagination: (paginationData) => {
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