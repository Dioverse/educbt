export default function ShortAnswerForm({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => updateFormData({ question_text: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.question_text ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your question here..."
        />
        {errors.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
        )}
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Answer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.correct_answer_text}
          onChange={(e) => updateFormData({ correct_answer_text: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.correct_answer_text ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter the expected answer..."
        />
        {errors.correct_answer_text && (
          <p className="mt-1 text-sm text-red-600">{errors.correct_answer_text}</p>
        )}
      </div>

      {/* Case Sensitive */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="case_sensitive"
          checked={formData.case_sensitive}
          onChange={(e) => updateFormData({ case_sensitive: e.target.checked })}
          className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
        />
        <label htmlFor="case_sensitive" className="text-sm text-gray-700">
          Case sensitive answer matching
        </label>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => updateFormData({ explanation: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Explain the correct answer..."
        />
      </div>
    </div>
  );
}