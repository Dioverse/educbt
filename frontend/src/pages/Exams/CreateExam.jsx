import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import examService from '../../services/examService';
import useExamStore from '../../store/examStore';

// Step Components
import BasicInfoStep from '../../components/Exams/CreateSteps/BasicInfoStep';
import TimingScheduleStep from '../../components/Exams/CreateSteps/TimingScheduleStep';
import QuestionsStep from '../../components/Exams/CreateSteps/QuestionsStep';
import ConfigurationStep from '../../components/Exams/CreateSteps/ConfigurationStep';
import ResultsProctoringStep from '../../components/Exams/CreateSteps/ResultsProctoringStep';

export default function CreateExam() {
  const navigate = useNavigate();
  
  const {
    examFormData,
    currentStep,
    totalSteps,
    setCurrentStep,
    nextStep,
    prevStep,
    resetExamFormData,
    updateExamFormData,
  } = useExamStore();

  const [errors, setErrors] = useState({});

  // Create mutation
  const createMutation = useMutation({
    mutationFn: examService.createExam,
    onSuccess: () => {
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
    // Validate current step
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
    // Final validation
    const finalErrors = validateAllSteps();
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    createMutation.mutate(examFormData);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
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
                      ? 'bg-green-600 text-white'
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
                  className={`text-xs mt-2 font-medium ${
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
              resetExamFormData();
              navigate('/exams');
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
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Exam'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}