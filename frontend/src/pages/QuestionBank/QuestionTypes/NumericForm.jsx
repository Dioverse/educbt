export default function NumericForm({ formData, updateFormData, errors }) {
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

      {/* Answer and Tolerance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.correct_answer_numeric || ''}
            onChange={(e) => updateFormData({ correct_answer_numeric: parseFloat(e.target.value) })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.correct_answer_numeric ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 3.14159"
          />
          {errors.correct_answer_numeric && (
            <p className="mt-1 text-sm text-red-600">{errors.correct_answer_numeric}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tolerance (±)
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.tolerance || ''}
            onChange={(e) => updateFormData({ tolerance: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 0.01"
          />
          <p className="mt-1 text-xs text-gray-500">
            Acceptable range: {formData.correct_answer_numeric - (formData.tolerance || 0)} to{' '}
            {formData.correct_answer_numeric + (formData.tolerance || 0)}
          </p>
        </div>
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
          placeholder="Explain the solution..."
        />
      </div>
    </div>
  );
}