import { Plus, Trash2, CheckCircle } from 'lucide-react';

export default function MultipleChoiceForm({ formData, updateFormData, errors, multipleAnswers = false }) {
  const questionText = formData?.question_text || '';
  const explanation = formData?.explanation || '';
  const options = formData?.options || [];

  const addOption = () => {
    const newOption = {
      option_key: String.fromCharCode(65 + options.length), // A, B, C, D...
      option_text: '',
      is_correct: false,
      display_order: options.length + 1,
    };
    updateFormData({ options: [...options, newOption] });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // If single answer, uncheck other options when one is checked
    if (field === 'is_correct' && value && !multipleAnswers) {
      newOptions.forEach((opt, i) => {
        if (i !== index) {
          opt.is_correct = false;
        }
      });
    }
    
    updateFormData({ options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    // Reassign option keys
    const reorderedOptions = newOptions.map((opt, i) => ({
      ...opt,
      option_key: String.fromCharCode(65 + i),
      display_order: i + 1,
    }));
    updateFormData({ options: reorderedOptions });
  };

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

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Answer Options <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addOption}
            className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Option
          </button>
        </div>

        {options.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No options added yet. Click "Add Option" to start.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg">
                <div className="flex items-center pt-3">
                  <input
                    type={multipleAnswers ? 'checkbox' : 'radio'}
                    checked={option.is_correct}
                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Option {option.option_key || String.fromCharCode(65 + index)}
                  </label>
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                    placeholder={`Enter option ${option.option_key || String.fromCharCode(65 + index)}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {option.is_correct && (
                  <div className="flex items-center pt-2">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={options.length <= 2 ? "Must have at least 2 options" : "Remove option"}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {errors?.options && (
          <p className="mt-2 text-sm text-red-600">{errors.options}</p>
        )}
        
        <p className="mt-2 text-xs text-gray-500">
          {multipleAnswers 
            ? 'Check all correct answers (students can select multiple)' 
            : 'Select one correct answer (students can select only one)'}
        </p>
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
          placeholder="Explain why the correct answer is correct..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}