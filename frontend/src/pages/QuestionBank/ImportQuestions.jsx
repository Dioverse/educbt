import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  Upload, 
  Download, 
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  ArrowLeft,
} from 'lucide-react';
import questionImportExportService from '../../services/questionImportExportService';

export default function ImportQuestions() {
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Download template mutation
  const templateMutation = useMutation({
    mutationFn: questionImportExportService.downloadTemplate,
    onSuccess: (data) => {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.data.download_url;
      link.download = data.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: questionImportExportService.importQuestions,
    onSuccess: (data) => {
      setImportResult(data.data);
      setSelectedFile(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Import failed');
    },
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        alert('Please select an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        alert('Please select an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }
    importMutation.mutate(selectedFile);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/questions')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Questions</h1>
          <p className="text-gray-600 mt-1">
            Upload Excel file to import questions in bulk
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          Instructions
        </h3>
        <ul className="space-y-2 text-sm text-teal-800">
          <li>• Download the Excel template to see the required format</li>
          <li>• Supported file types: Excel (.xlsx, .xls)</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Questions will be created as active and ready to use</li>
          <li>• Invalid rows will be skipped and reported</li>
          <li>• Options should be separated by "|" (pipe symbol)</li>
          <li>• Correct answers should be numbers (1,2,3) separated by commas for multiple answers</li>
        </ul>
        
        <button
          onClick={() => templateMutation.mutate()}
          disabled={templateMutation.isPending}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={20} />
          {templateMutation.isPending ? 'Generating...' : 'Download Excel Template'}
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileSpreadsheet size={20} />
          Upload Excel File
        </h3>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}
            ${selectedFile ? 'bg-green-50 border-green-500' : ''}
          `}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <FileSpreadsheet size={48} className="mx-auto text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <>
              <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your Excel file here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-teal-600 hover:underline font-medium">
                  browse
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: Excel (.xlsx, .xls)
              </p>
            </>
          )}
        </div>

        <button
          onClick={handleImport}
          disabled={!selectedFile || importMutation.isPending}
          className="mt-6 w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Importing...
            </>
          ) : (
            <>
              <Upload size={20} />
              Import Questions
            </>
          )}
        </button>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Import Results
          </h3>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-teal-50 rounded-lg text-center">
              <p className="text-sm text-teal-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-teal-900">{importResult.total}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-600 mb-1">Success</p>
              <p className="text-3xl font-bold text-green-900">{importResult.success_count}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-red-600 mb-1">Failed</p>
              <p className="text-3xl font-bold text-red-900">{importResult.failed_count}</p>
            </div>
          </div>

          {/* Imported Questions */}
          {importResult.imported?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-green-900 mb-3">
                Successfully Imported ({importResult.imported.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {importResult.imported.slice(0, 10).map((question, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <p className="font-medium text-gray-900">{question.question_text?.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Type: {question.type} | Marks: {question.marks} | Subject: {question.subject?.name}
                    </p>
                  </div>
                ))}
                {importResult.imported.length > 10 && (
                  <p className="text-sm text-gray-600 text-center">
                    ...and {importResult.imported.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Failed Imports */}
          {importResult.failed?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-red-900 mb-3">
                Failed Imports ({importResult.failed.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {importResult.failed.map((failed, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                    <p className="font-medium text-gray-900">Line {failed.line}</p>
                    <p className="text-xs text-red-600 mt-1">{failed.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setImportResult(null);
                setSelectedFile(null);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Import More Questions
            </button>
            <button
              onClick={() => navigate('/questions')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View Question Bank
            </button>
          </div>
        </div>
      )}
    </div>
  );
}