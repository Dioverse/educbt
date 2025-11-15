export default function TrueFalseForm({ formData, updateFormData, errors }) {
  const questionText = formData?.question_text || '';
  const explanation = formData?.explanation || '';
  const options = formData?.options || [];

  // Initialize options if empty
  if (options.length === 0) {
  updateFormData({
    options: [
      { option_key: 'A', option_text: 'True', is_correct: false, display_order: 1 },
      { option_key: 'B', option_text: 'False', is_correct: false, display_order: 2 },
    ]
  });
}



  const setCorrectAnswer = (isTrue) => {
  const newOptions = [
    { option_key: 'A', option_text: 'True', is_correct: isTrue, display_order: 1 },
    { option_key: 'B', option_text: 'False', is_correct: !isTrue, display_order: 2 },
  ];
  updateFormData({ options: newOptions });
};

  const correctAnswer = options.find(opt => opt.is_correct)?.option_text;

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
          placeholder="Enter a statement that is either true or false..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
            errors?.question_text ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors?.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
        )}
      </div>

      {/* Correct Answer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Correct Answer <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCorrectAnswer(true)}
            className={`p-6 border-2 rounded-lg text-center transition-all ${
              correctAnswer === 'True'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900 mb-1">True</div>
            {correctAnswer === 'True' && (
              <div className="text-sm text-green-600">✓ Correct Answer</div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCorrectAnswer(false)}
            className={`p-6 border-2 rounded-lg text-center transition-all ${
              correctAnswer === 'False'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <div className="text-2xl font-bold text-gray-900 mb-1">False</div>
            {correctAnswer === 'False' && (
              <div className="text-sm text-red-600">✓ Correct Answer</div>
            )}
          </button>
        </div>
        {errors?.options && (
          <p className="mt-2 text-sm text-red-600">{errors.options}</p>
        )}
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
          placeholder="Explain why this statement is true or false..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}