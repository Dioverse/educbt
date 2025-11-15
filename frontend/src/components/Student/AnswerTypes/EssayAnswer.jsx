import { useState } from 'react';

export default function EssayAnswer({ value, onChange }) {
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (text) => {
    onChange(text);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your essay here..."
        rows={15}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-serif text-base leading-relaxed"
      />
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <span>{value.length} characters</span>
        <span>{wordCount} words</span>
      </div>
    </div>
  );
}