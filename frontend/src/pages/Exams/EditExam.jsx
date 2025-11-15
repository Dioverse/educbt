import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Save } from 'lucide-react';
import examService from '../../services/examService';
import useExamStore from '../../store/examStore';

// Step Components (reuse from create)
import BasicInfoStep from '../../components/Exams/CreateSteps/BasicInfoStep';
import TimingScheduleStep from '../../components/Exams/CreateSteps/TimingScheduleStep';
import QuestionsStep from '../../components/Exams/CreateSteps/QuestionsStep';
import ConfigurationStep from '../../components/Exams/CreateSteps/ConfigurationStep';
import ResultsProctoringStep from '../../components/Exams/CreateSteps/ResultsProctoringStep';

export default function EditExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    examFormData,
    currentStep,
    totalSteps,
    setCurrentStep,
    nextStep,
    prevStep,
    resetExamFormData,
    loadExamForEdit,
  } = useExamStore();

  const [errors, setErrors] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch exam details
  const { data: examData, isLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExam(examId),
  });

  // Load exam data into form
  useEffect(() => {
    if (examData?.data && !isLoaded) {
      loadExamForEdit(examData.data);
      setIsLoaded(true);
    }
  }, [examData, isLoaded, loadExamForEdit]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => examService.updateExam(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['exam', examId]);
      queryClient.invalidateQueries(['exams']);
      resetExamFormData();
      navigate('/exams');
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const steps = [
    { number: 1, title: 'Basic Info', component: BasicInfoStep },
    { number: 2, title: 'Timing & Schedule', component: TimingScheduleStep },
    { number: 3, title: 'Questions', component: QuestionsStep },
    { number: 4, title: 'Configuration', component: ConfigurationStep },
    { number: 5, title: 'Results & Proctoring', component: ResultsProctoringStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    nextStep();
  };

  const handlePrevious = () => {
    setErrors({});
    prevStep();
  };

  const handleSubmit = () => {
    const finalErrors = validateAllSteps();
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      for (let i = 1; i <= totalSteps; i++) {
        if (Object.keys(validateStep(i)).length > 0) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }

    // Format data for submission
    const submitData = {
      ...examFormData,
      questions: examFormData.questions.map((q, index) => ({
        question_id: q.question_id || q.id,
        marks: q.marks,
        negative_marks: q.negative_marks || 0,
        display_order: index + 1,
        is_mandatory: q.is_mandatory ?? true,
      })),
    };

    updateMutation.mutate(submitData);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!examFormData.title.trim()) {
        newErrors.title = 'Exam title is required';
      }
      if (!examFormData.subject_id) {
        newErrors.subject_id = 'Subject is required';
      }
    }

    if (step === 2) {
      if (!examFormData.duration_minutes || examFormData.duration_minutes <= 0) {
        newErrors.duration_minutes = 'Duration must be greater than 0';
      }
      if (examFormData.is_scheduled) {
        if (!examFormData.start_datetime) {
          newErrors.start_datetime = 'Start date/time is required';
        }
        if (!examFormData.end_datetime) {
          newErrors.end_datetime = 'End date/time is required';
        }
      }
    }

    if (step === 3) {
      if (!examFormData.questions || examFormData.questions.length === 0) {
        newErrors.questions = 'At least one question is required';
      }
    }

    return newErrors;
  };

  const validateAllSteps = () => {
    let allErrors = {};
    for (let i = 1; i <= totalSteps; i++) {
      const stepErrors = validateStep(i);
      allErrors = { ...allErrors, ...stepErrors };
    }
    return allErrors;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
              resetExamFormData();
              navigate('/exams');
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Exam</h1>
          <p className="text-gray-600 mt-1">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep === step.number
                      ? 'bg-teal-600 text-white'
                      : currentStep > step.number
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check size={20} />
                  ) : (
                    step.number
                  )}
                </button>
                <span
                  className={`text-xs mt-2 font-medium text-center ${
                    currentStep === step.number
                      ? 'text-teal-600'
                      : currentStep > step.number
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step.number
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <CurrentStepComponent errors={errors} />
      </div>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-900 mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-red-800 text-sm">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                resetExamFormData();
                navigate('/exams');
              }
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}