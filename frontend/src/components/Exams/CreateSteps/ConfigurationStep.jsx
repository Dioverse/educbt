import useExamStore from '../../../store/examStore';

export default function ConfigurationStep({ errors }) {
  const { examFormData, updateExamFormData } = useExamStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Exam Configuration
        </h2>
        <p className="text-gray-600 mb-6">
          Configure exam attempts, scoring, and student experience
        </p>
      </div>

      {/* Attempts & Resume */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Attempts & Resume</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Attempts
          </label>
          <select
            value={examFormData.max_attempts}
            onChange={(e) => updateExamFormData({ max_attempts: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="1">1 attempt</option>
            <option value="2">2 attempts</option>
            <option value="3">3 attempts</option>
            <option value="5">5 attempts</option>
            <option value="10">10 attempts</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allow_resume"
            checked={examFormData.allow_resume}
            onChange={(e) => updateExamFormData({ allow_resume: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="allow_resume" className="text-sm text-gray-700">
            Allow students to resume exam if disconnected
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-save Interval (seconds)
          </label>
          <input
            type="number"
            value={examFormData.auto_save_interval_seconds}
            onChange={(e) => updateExamFormData({ 
              auto_save_interval_seconds: parseInt(e.target.value) 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            min="10"
          />
          <p className="mt-1 text-xs text-gray-500">
            How often to automatically save student answers
          </p>
        </div>
      </div>

      {/* Scoring */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Scoring</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pass Marks
          </label>
          <input
            type="number"
            step="0.01"
            value={examFormData.pass_marks}
            onChange={(e) => updateExamFormData({ pass_marks: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            min="0"
            placeholder="e.g., 40"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum marks required to pass the exam
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enable_negative_marking"
            checked={examFormData.enable_negative_marking}
            onChange={(e) => updateExamFormData({ enable_negative_marking: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="enable_negative_marking" className="text-sm text-gray-700">
            Enable negative marking for incorrect answers
          </label>
        </div>
      </div>

      {/* Student Review */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Student Review Options</h3>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allow_review_after_submit"
            checked={examFormData.allow_review_after_submit}
            onChange={(e) => updateExamFormData({ allow_review_after_submit: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="allow_review_after_submit" className="text-sm text-gray-700">
            Allow students to review their answers after submission
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allow_exam_paper_download"
            checked={examFormData.allow_exam_paper_download}
            onChange={(e) => updateExamFormData({ allow_exam_paper_download: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="allow_exam_paper_download" className="text-sm text-gray-700">
            Allow students to download exam paper after completion
          </label>
        </div>
      </div>
    </div>
  );
}