export default function MultipleChoiceSingle({ question, selectedOption, onChange }) {
  const options = question?.options || [];

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.id}
          className={`
            flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer
            transition-all hover:border-primary-300
            ${selectedOption === option.id 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-200'
            }
          `}
        >
          <input
            type="radio"
            name="answer"
            value={option.id}
            checked={selectedOption === option.id}
            onChange={() => onChange(option.id)}
            className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500"
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