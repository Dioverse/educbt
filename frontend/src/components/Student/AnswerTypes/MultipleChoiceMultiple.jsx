export default function MultipleChoiceMultiple({ question, selectedOptions, onChange }) {
  const options = question?.options || [];

  const handleToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      onChange(selectedOptions.filter(id => id !== optionId));
    } else {
      onChange([...selectedOptions, optionId]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        <strong>Note:</strong> You can select multiple answers
      </p>
      {options.map((option) => (
        <label
          key={option.id}
          className={`
            flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer
            transition-all hover:border-primary-300
            ${selectedOptions.includes(option.id)
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-200'
            }
          `}
        >
          <input
            type="checkbox"
            value={option.id}
            checked={selectedOptions.includes(option.id)}
            onChange={() => handleToggle(option.id)}
            className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <div className="flex-1">
            <div className="text-gray-900">{option.option_text}</div>
            {option.option_image_url && (
              <img
                src={option.option_image_url}
                alt="Option"
                className="mt-2 max-w-xs rounded border border-gray-200"
              />
            )}
          </div>
        </label>
      ))}
    </div>
  );
}