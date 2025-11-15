import { create } from 'zustand';

const useStudentExamStore = create((set, get) => ({
  // Available exams
  availableExams: [],
  myAttempts: [],

  // Current exam session
  currentAttempt: null,
  currentExam: null,
  questions: [],
  answers: {},
  
  // Navigation
  currentQuestionIndex: 0,
  
  // Timer
  timeRemaining: 0,
  timeSpent: 0,
  timerInterval: null,

  // Proctoring
  tabSwitchCount: 0,
  violations: [],
  isFullscreen: false,

  // Status
  loading: false,
  error: null,

  // Actions
  setAvailableExams: (exams) => set({ availableExams: exams }),
  setMyAttempts: (attempts) => set({ myAttempts: attempts }),
  setCurrentAttempt: (attempt) => set({ currentAttempt: attempt }),

  setCurrentSession: (session) => set({
    currentAttempt: session.attempt,
    currentExam: session.attempt.exam,
    questions: session.questions,
    answers: session.answers,
    currentQuestionIndex: session.progress.current_index,
    timeRemaining: session.time_remaining_seconds,
  }),

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  nextQuestion: () => set((state) => ({
    currentQuestionIndex: Math.min(
      state.currentQuestionIndex + 1,
      state.questions.length - 1
    ),
  })),

  prevQuestion: () => set((state) => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
  })),

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  // Answer management
  saveAnswer: (questionId, answer) => set((state) => ({
    answers: {
      ...state.answers,
      [questionId]: {
        ...state.answers[questionId],
        ...answer,
        is_answered: true,
      },
    },
  })),

  toggleMarkForReview: (questionId) => set((state) => {
    const current = state.answers[questionId] || {};
    return {
      answers: {
        ...state.answers,
        [questionId]: {
          ...current,
          is_marked_for_review: !current.is_marked_for_review,
        },
      },
    };
  }),

  // Timer management
  startTimer: () => {
    const interval = setInterval(() => {
      set((state) => {
        const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
        const newTimeSpent = state.timeSpent + 1;
        
        // Auto-submit when time runs out
        if (newTimeRemaining === 0 && state.timerInterval) {
          clearInterval(state.timerInterval);
          // Trigger auto-submit (handle this in component)
        }
        
        return {
          timeRemaining: newTimeRemaining,
          timeSpent: newTimeSpent,
        };
      });
    }, 1000);

    set({ timerInterval: interval });
  },

  stopTimer: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
      set({ timerInterval: null });
    }
  },

  // Proctoring
  incrementTabSwitch: () => set((state) => ({
    tabSwitchCount: state.tabSwitchCount + 1,
  })),

  addViolation: (violation) => set((state) => ({
    violations: [...state.violations, { ...violation, timestamp: Date.now() }],
  })),

  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  // Reset
  resetExamSession: () => {
    const { timerInterval } = get();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    set({
      currentAttempt: null,
      currentExam: null,
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      timeRemaining: 0,
      timeSpent: 0,
      timerInterval: null,
      tabSwitchCount: 0,
      violations: [],
      isFullscreen: false,
    });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearStore: () => set({
    availableExams: [],
    myAttempts: [],
    currentAttempt: null,
  }),
  
}));

export default useStudentExamStore;