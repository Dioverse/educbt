export default function NumericForm({ formData, updateFormData, errors }) {
  const questionText = formData?.question_text || '';
  const explanation = formData?.explanation || '';
  const correctAnswer = formData?.correct_answer_numeric ?? '';
  const tolerance = formData?.tolerance ?? 0;

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

      {/* Correct Answer and Tolerance */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correct Answer <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={correctAnswer}
            onChange={(e) => updateFormData({ 
              correct_answer_numeric: e.target.value ? parseFloat(e.target.value) : null 
            })}
            placeholder="e.g., 3.14"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors?.correct_answer_numeric ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors?.correct_answer_numeric && (
            <p className="mt-1 text-sm text-red-600">{errors.correct_answer_numeric}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tolerance (±)
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={tolerance}
            onChange={(e) => updateFormData({ 
              tolerance: e.target.value ? parseFloat(e.target.value) : 0 
            })}
            placeholder="e.g., 0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Acceptable range: {correctAnswer ? (parseFloat(correctAnswer) - tolerance).toFixed(2) : '...'} to {correctAnswer ? (parseFloat(correctAnswer) + tolerance).toFixed(2) : '...'}
          </p>
        </div>
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
          placeholder="Show the solution or working..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}