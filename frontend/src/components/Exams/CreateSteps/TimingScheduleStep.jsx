import useExamStore from '../../../store/examStore';

export default function TimingScheduleStep({ errors }) {
  const { examFormData, updateExamFormData } = useExamStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Timing & Schedule
        </h2>
        <p className="text-gray-600 mb-6">
          Configure the timing and schedule for your exam
        </p>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exam Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={examFormData.duration_minutes}
          onChange={(e) => updateExamFormData({ duration_minutes: parseInt(e.target.value) })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
          }`}
          min="1"
          placeholder="e.g., 60"
        />
        {errors.duration_minutes && (
          <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Total time students will have to complete the exam
        </p>
      </div>

      {/* Time Per Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Per Question (seconds) - Optional
        </label>
        <input
          type="number"
          value={examFormData.time_per_question_seconds || ''}
          onChange={(e) => updateExamFormData({ 
            time_per_question_seconds: e.target.value ? parseInt(e.target.value) : null 
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          min="1"
          placeholder="e.g., 60"
        />
        <p className="mt-1 text-xs text-gray-500">
          Set individual time limit for each question
        </p>
      </div>

      {/* Scheduled Exam */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="is_scheduled"
            checked={examFormData.is_scheduled}
            onChange={(e) => updateExamFormData({ is_scheduled: e.target.checked })}
            className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="is_scheduled" className="text-sm font-medium text-gray-700">
            Schedule this exam
          </label>
        </div>

        {examFormData.is_scheduled && (
          <div className="space-y-4 pl-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={examFormData.start_datetime}
                  onChange={(e) => updateExamFormData({ start_datetime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.start_datetime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_datetime && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_datetime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={examFormData.end_datetime}
                  onChange={(e) => updateExamFormData({ end_datetime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.end_datetime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_datetime && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_datetime}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Students will only be able to access the exam during this time period
            </p>
          </div>
        )}
      </div>

      {/* Question Display Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Question Display</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions Per Page
            </label>
            <select
              value={examFormData.questions_per_page}
              onChange={(e) => updateExamFormData({ questions_per_page: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="1">1 question per page</option>
              <option value="5">5 questions per page</option>
              <option value="10">10 questions per page</option>
              <option value="0">All questions on one page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="randomize_questions"
              checked={examFormData.randomize_questions}
              onChange={(e) => updateExamFormData({ randomize_questions: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="randomize_questions" className="text-sm text-gray-700">
              Randomize question order for each student
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="randomize_options"
              checked={examFormData.randomize_options}
              onChange={(e) => updateExamFormData({ randomize_options: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="randomize_options" className="text-sm text-gray-700">
              Randomize answer options (for multiple choice questions)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}