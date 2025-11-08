import { useEffect } from 'react';

export default function TrueFalseForm({ formData, updateFormData, errors }) {
  // Initialize options if not set
  useEffect(() => {
    if (!formData.options || formData.options.length === 0) {
      updateFormData({
        options: [
          { option_key: 'A', option_text: 'True', is_correct: false },
          { option_key: 'B', option_text: 'False', is_correct: false },
        ],
      });
    }
  }, []);

  const setCorrectAnswer = (isTrue) => {
    updateFormData({
      options: [
        { option_key: 'A', option_text: 'True', is_correct: isTrue },
        { option_key: 'B', option_text: 'False', is_correct: !isTrue },
      ],
    });
  };

  const currentAnswer = formData.options?.find(opt => opt.is_correct);

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Statement <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => updateFormData({ question_text: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.question_text ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter a statement that is either true or false..."
        />
        {errors.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
        )}
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Correct Answer <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCorrectAnswer(true)}
            className={`flex-1 p-4 border-2 rounded-lg font-medium transition-all ${
              currentAnswer?.option_text === 'True'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            True
          </button>
          <button
            type="button"
            onClick={() => setCorrectAnswer(false)}
            className={`flex-1 p-4 border-2 rounded-lg font-medium transition-all ${
              currentAnswer?.option_text === 'False'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            False
          </button>
        </div>
        {errors.options && (
          <p className="mt-2 text-sm text-red-600">{errors.options}</p>
        )}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Explain why the statement is true or false..."
        />
      </div>
    </div>
  );
}