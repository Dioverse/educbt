import MultipleChoiceSingle from './AnswerTypes/MultipleChoiceSingle';
import MultipleChoiceMultiple from './AnswerTypes/MultipleChoiceMultiple';
import TrueFalse from './AnswerTypes/TrueFalse';
import ShortAnswer from './AnswerTypes/ShortAnswer';
import NumericAnswer from './AnswerTypes/NumericAnswer';
import EssayAnswer from './AnswerTypes/EssayAnswer';

export default function AnswerInput({ question, currentAnswer, onAnswerChange }) {
  if (!question) return null;

  const questionType = question.question?.type;

  const renderAnswerInput = () => {
    switch (questionType) {
      case 'multiple_choice_single':
        return (
          <MultipleChoiceSingle
            question={question.question}
            selectedOption={currentAnswer?.selected_option_ids?.[0]}
            onChange={(optionId) => onAnswerChange({ selectedAnswer: [optionId] })}
          />
        );

      case 'multiple_choice_multiple':
        return (
          <MultipleChoiceMultiple
            question={question.question}
            selectedOptions={currentAnswer?.selected_option_ids || []}
            onChange={(optionIds) => onAnswerChange({ selectedAnswer: optionIds })}
          />
        );

      case 'true_false':
        return (
          <TrueFalse
            selectedOption={currentAnswer?.selected_option_ids?.[0]}
            onChange={(optionId) => onAnswerChange({ selectedAnswer: [optionId] })}
            options={question.question?.options}
          />
        );

      case 'short_answer':
        return (
          <ShortAnswer
            value={currentAnswer?.text_answer || ''}
            onChange={(text) => onAnswerChange({ textAnswer: text })}
          />
        );

      case 'numeric':
        return (
          <NumericAnswer
            value={currentAnswer?.numeric_answer || ''}
            onChange={(value) => onAnswerChange({ numericAnswer: value })}
          />
        );

      case 'essay':
        return (
          <EssayAnswer
            value={currentAnswer?.text_answer || ''}
            onChange={(text) => onAnswerChange({ textAnswer: text })}
          />
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Question type "{questionType}" is not yet supported for answering.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
      {renderAnswerInput()}
    </div>
  );
}