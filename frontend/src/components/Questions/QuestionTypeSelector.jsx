import { 
  CheckSquare, 
  Circle, 
  Type, 
  Hash, 
  FileText,
} from 'lucide-react';

export default function QuestionTypeSelector({ value, onChange, error }) {
  const questionTypes = [
    {
      type: 'multiple_choice_single',
      name: 'Multiple Choice (Single)',
      description: 'Select one correct answer',
      icon: Circle,
      color: 'blue',
    },
    {
      type: 'multiple_choice_multiple',
      name: 'Multiple Choice (Multiple)',
      description: 'Select multiple correct answers',
      icon: CheckSquare,
      color: 'green',
    },
    {
      type: 'true_false',
      name: 'True/False',
      description: 'Simple true or false question',
      icon: CheckSquare,
      color: 'purple',
    },
    {
      type: 'short_answer',
      name: 'Short Answer',
      description: 'Text-based short answer',
      icon: Type,
      color: 'yellow',
    },
    {
      type: 'numeric',
      name: 'Numeric Answer',
      description: 'Numerical answer with tolerance',
      icon: Hash,
      color: 'orange',
    },
    {
      type: 'essay',
      name: 'Essay/Long Answer',
      description: 'Rich text or file upload',
      icon: FileText,
      color: 'red',
    },
  ];

  const getColorClasses = (color, isSelected) => {
    const baseClasses = 'border-2 transition-all';
    
    if (isSelected) {
      const selectedColors = {
        blue: 'border-primary-500 bg-primary-50',
        green: 'border-green-500 bg-green-50',
        purple: 'border-purple-500 bg-purple-50',
        yellow: 'border-yellow-500 bg-yellow-50',
        orange: 'border-orange-500 bg-orange-50',
        red: 'border-red-500 bg-red-50',
      };
      return `${baseClasses} ${selectedColors[color]}`;
    }
    
    const hoverColors = {
      blue: 'border-gray-200 hover:border-primary-300 hover:bg-primary-50',
      green: 'border-gray-200 hover:border-green-300 hover:bg-green-50',
      purple: 'border-gray-200 hover:border-purple-300 hover:bg-purple-50',
      yellow: 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50',
      orange: 'border-gray-200 hover:border-orange-300 hover:bg-orange-50',
      red: 'border-gray-200 hover:border-red-300 hover:bg-red-50',
    };
    
    return `${baseClasses} ${hoverColors[color]}`;
  };

  const getIconBgColor = (color, isSelected) => {
    if (isSelected) {
      const colors = {
        blue: 'bg-primary-100',
        green: 'bg-green-100',
        purple: 'bg-purple-100',
        yellow: 'bg-yellow-100',
        orange: 'bg-orange-100',
        red: 'bg-red-100',
      };
      return colors[color];
    }
    return 'bg-gray-100';
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-primary-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
    };
    return colors[color] || colors.blue;
  };

  const getCheckmarkBg = (color) => {
    const colors = {
      blue: 'bg-primary-600',
      green: 'bg-green-600',
      purple: 'bg-purple-600',
      yellow: 'bg-yellow-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600',
    };
    return colors[color];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionTypes.map((questionType) => {
            const Icon = questionType.icon;
            const isSelected = value === questionType.type;
            
            return (
              <button
                key={questionType.type}
                type="button"
                onClick={() => onChange(questionType.type)}
                className={`
                  p-4 rounded-lg text-left cursor-pointer
                  ${getColorClasses(questionType.color, isSelected)}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg flex-shrink-0
                    ${getIconBgColor(questionType.color, isSelected)}
                  `}>
                    <Icon className={getIconColor(questionType.color)} size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {questionType.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {questionType.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className={`
                      p-1 rounded-full flex-shrink-0
                      ${getCheckmarkBg(questionType.color)}
                    `}>
                      <CheckSquare size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}