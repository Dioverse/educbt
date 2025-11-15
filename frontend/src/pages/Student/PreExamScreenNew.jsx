import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Award, 
  AlertCircle,
  Camera,
  CheckCircle,
  Play,
} from 'lucide-react';
import examService from '../../services/examService';
import studentExamService from '../../services/studentExamService';

export default function PreExamScreen() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  // Fetch exam details
  const { data: examData, isLoading } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examService.getExam(examId),
  });

  // Start exam mutation
  const startMutation = useMutation({
    mutationFn: () => studentExamService.startExam(examId, selfieFile),
    onSuccess: (data) => {
      navigate(`/student/exam/${data.data.attempt_id}/session`);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to start exam');
    },
  });

  const exam = examData?.data;

  const handleSelfieCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartExam = () => {
    if (!agreedToTerms) {
      alert('Please agree to the exam terms and conditions');
      return;
    }

    if (exam?.require_webcam && !selfieFile) {
      alert('Please capture your photo before starting the exam');
      return;
    }

    startMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Exam not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-gray-600 mt-2">{exam.subject?.name}</p>
        </div>

        {/* Exam Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">{exam.duration_minutes} min</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="mx-auto text-green-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-xl font-bold text-gray-900">{exam.questions?.length || 0}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="text-xl font-bold text-gray-900">{exam.total_marks}</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Award className="mx-auto text-orange-600 mb-2" size={24} />
              <p className="text-sm text-gray-600">Pass Marks</p>
              <p className="text-xl font-bold text-gray-900">{exam.pass_marks}</p>
            </div>
          </div>

          {exam.description && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{exam.description}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
          
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p>Read each question carefully before answering.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p>You can navigate between questions using the question navigator.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p>Your answers are automatically saved as you go.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p>You can flag questions for review and come back to them later.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p>Once you submit, you cannot change your answers.</p>
            </div>
            
            {exam.enable_negative_marking && (
              <div className="flex items-start gap-3 mt-4 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                <p className="text-yellow-800">
                  <strong>Negative Marking:</strong> Wrong answers will result in negative marks.
                </p>
              </div>
            )}

            {exam.instructions && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Additional Instructions:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{exam.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Exam Rules */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={24} />
            Important Rules
          </h2>
          
          <ul className="space-y-2 text-gray-800">
            {exam.disable_copy_paste && (
              <li>• Copy and paste is disabled during this exam</li>
            )}
            {exam.enable_tab_switch_detection && (
              <li>• Switching tabs or windows will be detected and logged</li>
            )}
            {exam.lock_fullscreen && (
              <li>• The exam must be taken in fullscreen mode</li>
            )}
            {exam.require_webcam && (
              <li>• Webcam verification is required before starting</li>
            )}
            <li>• Do not refresh the page during the exam</li>
            <li>• Ensure stable internet connection throughout the exam</li>
            <li>• Any suspicious activity will be flagged for review</li>
          </ul>
        </div>

        {/* Selfie Capture */}
        {exam.require_webcam && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Camera size={24} />
              Identity Verification
            </h2>
            
            <p className="text-gray-600 mb-4">
              Please capture a clear photo of yourself before starting the exam.
            </p>

            {selfiePreview ? (
              <div className="text-center">
                <img 
                  src={selfiePreview} 
                  alt="Selfie preview" 
                  className="w-48 h-48 object-cover rounded-lg mx-auto mb-4 border-2 border-green-500"
                />
                <p className="text-green-600 mb-2">✓ Photo captured successfully</p>
                <button
                  onClick={() => {
                    setSelfieFile(null);
                    setSelfiePreview(null);
                  }}
                  className="text-primary-600 hover:underline text-sm"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <div className="text-center">
                <label className="cursor-pointer">
                  <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4 hover:border-primary-500 transition-colors">
                    <Camera size={48} className="text-gray-400" />
                  </div>
                  <span className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center gap-2">
                    <Camera size={20} />
                    Capture Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleSelfieCapture}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-gray-700">
              I have read and understood all the instructions and rules. I agree to follow the 
              exam guidelines and understand that any violation may result in disqualification.
            </span>
          </label>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartExam}
            disabled={!agreedToTerms || startMutation.isPending || (exam.require_webcam && !selfieFile)}
            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg font-semibold"
          >
            {startMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Starting Exam...
              </>
            ) : (
              <>
                <Play size={24} />
                Start Exam Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}