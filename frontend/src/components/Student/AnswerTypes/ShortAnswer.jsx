export default function ShortAnswer({ value, onChange }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />
      <p className="mt-2 text-sm text-gray-600">
        {value.length} characters
      </p>
    </div>
  );
}