import { 
  CheckSquare, 
  ToggleLeft, 
  Type, 
  Hash, 
  FileText,
  Image,
  Video,
  Link2,
  Move,
} from 'lucide-react';

export default function QuestionTypeSelector({ value, onChange, error }) {
  const questionTypes = [
    {
      value: 'multiple_choice_single',
      label: 'Multiple Choice (Single)',
      description: 'Select one correct answer',
      icon: CheckSquare,
    },
    {
      value: 'multiple_choice_multiple',
      label: 'Multiple Choice (Multiple)',
      description: 'Select multiple correct answers',
      icon: CheckSquare,
    },
    {
      value: 'true_false',
      label: 'True/False',
      description: 'Simple true or false question',
      icon: ToggleLeft,
    },
    {
      value: 'short_answer',
      label: 'Short Answer',
      description: 'Text-based answer',
      icon: Type,
    },
    {
      value: 'numeric',
      label: 'Numeric',
      description: 'Number-based answer with tolerance',
      icon: Hash,
    },
    {
      value: 'essay',
      label: 'Essay/Theory',
      description: 'Long-form answer with file upload',
      icon: FileText,
    },
    {
      value: 'image_based',
      label: 'Image Based',
      description: 'Question with image',
      icon: Image,
    },
    {
      value: 'audio_video',
      label: 'Audio/Video',
      description: 'Media-based question',
      icon: Video,
    },
    {
      value: 'match_following',
      label: 'Match Following',
      description: 'Match pairs of items',
      icon: Link2,
    },
    {
      value: 'drag_drop',
      label: 'Drag & Drop',
      description: 'Drag items to correct positions',
      icon: Move,
    },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Question Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {questionTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                value === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  size={24}
                  className={value === type.value ? 'text-blue-600' : 'text-gray-400'}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {type.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}