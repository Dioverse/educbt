import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Eye,
} from 'lucide-react';
import api from '../../config/api';

export default function ImportStudents() {
  const navigate = useNavigate();
  
  const [importMode, setImportMode] = useState('file'); // 'file' or 'manual'
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [students, setStudents] = useState([
    { name: '', email: '', student_id: '', phone: '' },
  ]);
  const [importResult, setImportResult] = useState(null);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/v1/users/import/students/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (response) => {
      setImportResult(response.data);
      setFile(null);
      setPreviewData([]);
    },
  });

  // Manual import mutation
  const importMutation = useMutation({
    mutationFn: (data) => api.post('/v1/users/import/students', { students: data }),
    onSuccess: (response) => {
      setImportResult(response.data.data);
    },
  });

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.csv') && 
        !selectedFile.name.endsWith('.xlsx') && 
        !selectedFile.name.endsWith('.xls')) {
      alert('Please select a valid CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    
    // Parse CSV for preview
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
        
        setPreviewData(preview);
      };
      reader.readAsText(selectedFile);
    }
  };

  // Handle file upload
  const handleFileUpload = () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  // Manual entry functions
  const addStudent = () => {
    setStudents([...students, { name: '', email: '', student_id: '', phone: '' }]);
  };

  const removeStudent = (index) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const updateStudent = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleManualImport = () => {
    const validStudents = students.filter(s => s.name && s.email && s.student_id);
    if (validStudents.length === 0) {
      alert('Please fill in at least one complete student record');
      return;
    }
    importMutation.mutate(validStudents);
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,student_id,phone\nJohn Doe,john@student.com,STU001,08012345678\nJane Smith,jane@student.com,STU002,08087654321\nBob Johnson,bob@student.com,STU003,08098765432';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setImportResult(null);
    setFile(null);
    setPreviewData([]);
    setStudents([{ name: '', email: '', student_id: '', phone: '' }]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Students</h1>
          <p className="text-gray-600 mt-1">
            Add multiple students via file upload or manual entry
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <h3 className="font-medium text-teal-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
          <li>Upload a CSV or Excel file with student data, or enter manually</li>
          <li>Required fields: Name, Email, Student ID</li>
          <li>Each student will receive an auto-generated password</li>
          <li>Students can login with their email and provided password</li>
          <li>Email and Student ID must be unique</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm"
        >
          <Download size={16} />
          Download CSV Template
        </button>
      </div>

      {/* Import Mode Selector */}
      {!importResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Choose Import Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setImportMode('file')}
              className={`p-6 border-2 rounded-lg transition-all ${
                importMode === 'file'
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-300 hover:border-teal-400'
              }`}
            >
              <FileSpreadsheet className="mx-auto mb-3 text-teal-600" size={48} />
              <p className="font-medium text-gray-900">Upload File</p>
              <p className="text-sm text-gray-600 mt-1">CSV or Excel file</p>
            </button>

            <button
              onClick={() => setImportMode('manual')}
              className={`p-6 border-2 rounded-lg transition-all ${
                importMode === 'manual'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <Upload className="mx-auto mb-3 text-green-600" size={48} />
              <p className="font-medium text-gray-900">Manual Entry</p>
              <p className="text-sm text-gray-600 mt-1">Type details manually</p>
            </button>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {importMode === 'file' && !importResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet size={20} />
            Upload Student File
          </h3>

          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-700 font-medium mb-2">
                Drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports CSV, XLS, XLSX files (Max 5MB)
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer inline-flex items-center gap-2">
                  <Upload size={20} />
                  Select File
                </span>
              </label>
            </div>
          ) : (
            <>
              {/* Selected File Info */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-teal-600" size={32} />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreviewData([]);
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Preview Data */}
              {previewData.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Eye size={18} />
                      Preview (First 5 rows)
                    </h4>
                    <span className="text-sm text-gray-600">
                      Total rows in file: {previewData.length}+
                    </span>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Student ID</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{row.name || '-'}</td>
                            <td className="px-4 py-2">{row.email || '-'}</td>
                            <td className="px-4 py-2">{row.student_id || '-'}</td>
                            <td className="px-4 py-2">{row.phone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleFileUpload}
                disabled={uploadMutation.isPending}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing File...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Import Students from File
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Manual Entry Section */}
      {importMode === 'manual' && !importResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Student Details</h3>
            <button
              onClick={addStudent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              + Add Another Student
            </button>
          </div>

          <div className="space-y-4">
            {students.map((student, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium text-gray-900">Student #{index + 1}</p>
                  {students.length > 1 && (
                    <button
                      onClick={() => removeStudent(index)}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => updateStudent(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={student.email}
                      onChange={(e) => updateStudent(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="john@student.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={student.student_id}
                      onChange={(e) => updateStudent(index, 'student_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="STU001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={student.phone}
                      onChange={(e) => updateStudent(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="08012345678"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleManualImport}
            disabled={importMutation.isPending}
            className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
          >
            {importMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Import {students.length} Student(s)
              </>
            )}
          </button>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Import Results
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-teal-50 rounded-lg text-center">
              <p className="text-sm text-teal-600">Total</p>
              <p className="text-2xl font-bold text-teal-900">{importResult.total}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-600">Success</p>
              <p className="text-2xl font-bold text-green-900">{importResult.success_count}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-900">{importResult.failed_count}</p>
            </div>
          </div>

          {importResult.imported?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-green-900 mb-3">Successfully Imported:</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {importResult.imported.map((student, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email} | {student.student_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Default Password:</p>
                        <p className="font-mono text-sm font-bold text-green-700">{student.default_password}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {importResult.failed?.length > 0 && (
            <div>
              <h4 className="font-medium text-red-900 mb-3">Failed Imports:</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {importResult.failed.map((failed, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{failed.email || failed.name || 'Unknown'}</p>
                    <p className="text-xs text-red-600">{failed.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={resetImport}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Import More Students
            </button>
            <button
              onClick={() => navigate('/admin/users?role=student')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View All Students
            </button>
          </div>
        </div>
      )}
    </div>
  );
}