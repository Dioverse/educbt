import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export default function MultipleChoiceForm({ formData, updateFormData, errors, multipleAnswers = false }) {
  const addOption = () => {
    const newOption = {
      option_key: String.fromCharCode(65 + formData.options.length), // A, B, C...
      option_text: '',
      option_html: '',
      option_image: null,
      is_correct: false,
    };
    updateFormData({ options: [...formData.options, newOption] });
  };

  const updateOption = (index, field, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    
    // If single answer, uncheck other options
    if (field === 'is_correct' && value && !multipleAnswers) {
      updatedOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false;
      });
    }
    
    updateFormData({ options: updatedOptions });
  };

  const removeOption = (index) => {
    const updatedOptions = formData.options.filter((_, i) => i !== index);
    // Reorder option keys
    updatedOptions.forEach((opt, i) => {
      opt.option_key = String.fromCharCode(65 + i);
    });
    updateFormData({ options: updatedOptions });
  };

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

      {/* Options */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Options <span className="text-red-500">*</span>
            {multipleAnswers && (
              <span className="ml-2 text-xs text-gray-500">(Select all correct answers)</span>
            )}
          </label>
          <button
            type="button"
            onClick={addOption}
            className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Option
          </button>
        </div>

        {formData.options.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">No options added yet</p>
            <button
              type="button"
              onClick={addOption}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Add your first option
            </button>
          </div>
        )}

        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg"
            >
              <input
                type={multipleAnswers ? 'checkbox' : 'radio'}
                checked={option.is_correct}
                onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                className="mt-1 h-5 w-5 text-primary-600"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 min-w-[30px]">
                    {option.option_key}.
                  </span>
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                    placeholder={`Option ${option.option_key}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {errors.options && (
          <p className="mt-2 text-sm text-red-600">{errors.options}</p>
        )}
      </div>
    </div>
  );
}