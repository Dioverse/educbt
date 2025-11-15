import { FileText, Upload } from 'lucide-react';

export default function EssayForm({ formData, updateFormData, errors }) {
  // Safely access properties with defaults
  const questionText = formData?.question_text || '';
  const explanation = formData?.explanation || '';
  const minWords = formData?.min_words || '';
  const maxWords = formData?.max_words || '';
  const allowFileUpload = formData?.allow_file_upload || false;
  const allowedFileTypes = formData?.allowed_file_types || [];
  const maxFileSize = formData?.max_file_size_kb || 10240;

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'txt', label: 'TXT' },
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'jpeg', label: 'JPEG' },
  ];

  const handleFileTypeToggle = (fileType) => {
    const currentTypes = allowedFileTypes;
    const newTypes = currentTypes.includes(fileType)
      ? currentTypes.filter(t => t !== fileType)
      : [...currentTypes, fileType];
    
    updateFormData({ allowed_file_types: newTypes });
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          value={questionText}
          onChange={(e) => updateFormData({ question_text: e.target.value })}
          rows={5}
          placeholder="Enter your essay question..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
            errors?.question_text ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors?.question_text && (
          <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Write a clear and detailed essay question or prompt
        </p>
      </div>

      {/* Word Count Limits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Word Count Limits (Optional)
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Minimum Words
            </label>
            <input
              type="number"
              min="0"
              value={minWords}
              onChange={(e) => updateFormData({ 
                min_words: e.target.value ? parseInt(e.target.value) : null 
              })}
              placeholder="e.g., 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Maximum Words
            </label>
            <input
              type="number"
              min="0"
              value={maxWords}
              onChange={(e) => updateFormData({ 
                max_words: e.target.value ? parseInt(e.target.value) : null 
              })}
              placeholder="e.g., 500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <p className="mt-2 text-xs text-gray-500">
          Set word limits to guide students on answer length. Leave empty for no limits.
        </p>
      </div>

      {/* File Upload Settings */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="allowFileUpload"
            checked={allowFileUpload}
            onChange={(e) => updateFormData({ allow_file_upload: e.target.checked })}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="allowFileUpload" className="text-sm font-medium text-gray-700">
            Allow File Upload
          </label>
        </div>

        {allowFileUpload && (
          <div className="ml-7 space-y-4 bg-gray-50 p-4 rounded-lg">
            {/* Allowed File Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allowed File Types
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fileTypeOptions.map((fileType) => (
                  <label
                    key={fileType.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={allowedFileTypes.includes(fileType.value)}
                      onChange={() => handleFileTypeToggle(fileType.value)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      .{fileType.label}
                    </span>
                  </label>
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
                min="0"
                step="1024"
                value={maxFileSize}
                onChange={(e) => updateFormData({ 
                  max_file_size_kb: parseInt(e.target.value) || 10240 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                {(maxFileSize / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Explanation/Answer Guide */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Answer / Grading Guide (Optional)
        </label>
        <textarea
          value={explanation}
          onChange={(e) => updateFormData({ explanation: e.target.value })}
          rows={4}
          placeholder="Provide a model answer or key points to guide grading..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          This will help supervisors grade the essay consistently
        </p>
      </div>

      {/* Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Essay Question Preview</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Answer Type:</strong> Long-form text essay
              </p>
              {minWords && (
                <p>
                  <strong>Minimum Words:</strong> {minWords}
                </p>
              )}
              {maxWords && (
                <p>
                  <strong>Maximum Words:</strong> {maxWords}
                </p>
              )}
              {allowFileUpload && (
                <p>
                  <strong>File Upload:</strong> Allowed ({allowedFileTypes.join(', ') || 'any type'})
                </p>
              )}
              <p className="text-xs mt-2 text-blue-700">
                ⚠️ This question requires manual grading by a supervisor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}