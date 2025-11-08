export default function EssayForm({ formData, updateFormData, errors }) {
  const handleFileTypeToggle = (type) => {
    const types = formData.allowed_file_types || [];
    const updated = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    updateFormData({ allowed_file_types: updated });
  };

  const fileTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'];

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question/Essay Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question_text}
          onChange={(e) => updateFormData({ question_text: e.target.value })}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.question_text ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your essay question or prompt here..."
        />
        {errors.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
        )}
      </div>

      {/* Word Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Words
          </label>
          <input
            type="number"
            value={formData.min_words || ''}
            onChange={(e) => updateFormData({ min_words: parseInt(e.target.value) || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Words
          </label>
          <input
            type="number"
            value={formData.max_words || ''}
            onChange={(e) => updateFormData({ max_words: parseInt(e.target.value) || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 500"
          />
        </div>
      </div>

      {/* File Upload Options */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="allow_file_upload"
            checked={formData.allow_file_upload}
            onChange={(e) => updateFormData({ allow_file_upload: e.target.checked })}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="allow_file_upload" className="text-sm font-medium text-gray-700">
            Allow file uploads with answer
          </label>
        </div>

        {formData.allow_file_upload && (
          <div className="space-y-4 pl-6">
            {/* Allowed File Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed File Types
              </label>
              <div className="flex flex-wrap gap-2">
                {fileTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleFileTypeToggle(type)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      formData.allowed_file_types?.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    .{type}
                  </button>
                ))}
              </div>
            </div>

            {/* Max File Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (KB)
              </label>
              <input
                type="number"
                value={formData.max_file_size_kb || ''}
                onChange={(e) => updateFormData({ max_file_size_kb: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10240 (10MB)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rubric/Guidelines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grading Guidelines/Rubric (Optional)
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => updateFormData({ explanation: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter grading criteria and guidelines for markers..."
        />
      </div>
    </div>
  );
}