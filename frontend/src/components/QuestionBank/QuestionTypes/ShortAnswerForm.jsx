export default function ShortAnswerForm({ formData, updateFormData, errors }) {
  const questionText = formData?.question_text || '';
  const explanation = formData?.explanation || '';
  const correctAnswerText = formData?.correct_answer_text || '';
  const caseSensitive = formData?.case_sensitive || false;

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          value={questionText}
          onChange={(e) => updateFormData({ question_text: e.target.value })}
          rows={4}
          placeholder="Enter your question..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
            errors?.question_text ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors?.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
        )}
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={correctAnswerText}
          onChange={(e) => updateFormData({ correct_answer_text: e.target.value })}
          placeholder="Enter the correct answer..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
            errors?.correct_answer_text ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors?.correct_answer_text && (
          <p className="mt-1 text-sm text-red-600">{errors.correct_answer_text}</p>
        )}
      </div>

      {/* Case Sensitive */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={caseSensitive}
          onChange={(e) => updateFormData({ case_sensitive: e.target.checked })}
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label htmlFor="caseSensitive" className="text-sm text-gray-700">
          Case sensitive (e.g., "Paris" ≠ "paris")
        </label>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (Optional)
        </label>
        <textarea
          value={explanation}
          onChange={(e) => updateFormData({ explanation: e.target.value })}
          rows={3}
          placeholder="Provide additional context or explanation..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}