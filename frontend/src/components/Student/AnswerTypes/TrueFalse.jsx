import { CheckCircle, XCircle } from 'lucide-react';

export default function TrueFalse({ selectedOption, onChange, options }) {
  const trueOption = options?.find(o => o.option_text.toLowerCase() === 'true');
  const falseOption = options?.find(o => o.option_text.toLowerCase() === 'false');

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onChange(trueOption?.id)}
        className={`
          p-6 border-2 rounded-lg transition-all
          ${selectedOption === trueOption?.id
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 hover:border-green-300'
          }
        `}
      >
        <CheckCircle 
          size={48} 
          className={`mx-auto mb-2 ${
            selectedOption === trueOption?.id ? 'text-green-600' : 'text-gray-400'
          }`}
        />
        <span className={`text-lg font-semibold ${
          selectedOption === trueOption?.id ? 'text-green-900' : 'text-gray-700'
        }`}>
          True
        </span>
      </button>

      <button
        onClick={() => onChange(falseOption?.id)}
        className={`
          p-6 border-2 rounded-lg transition-all
          ${selectedOption === falseOption?.id
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200 hover:border-red-300'
          }
        `}
      >
        <XCircle 
          size={48} 
          className={`mx-auto mb-2 ${
            selectedOption === falseOption?.id ? 'text-red-600' : 'text-gray-400'
          }`}
        />
        <span className={`text-lg font-semibold ${
          selectedOption === falseOption?.id ? 'text-red-900' : 'text-gray-700'
        }`}>
          False
        </span>
      </button>
    </div>
  );
}