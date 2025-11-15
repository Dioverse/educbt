export default function NumericAnswer({ value, onChange }) {
  return (
    <div>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter numeric answer"
        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <p className="mt-2 text-sm text-gray-600">
        Enter numbers only (decimals allowed)
      </p>
    </div>
  );
}