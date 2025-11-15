import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  Eye,
} from 'lucide-react';
import api from '../../config/api';

export default function ImportSupervisors() {
  const navigate = useNavigate();
  
  const [importMode, setImportMode] = useState('file'); // 'file' or 'manual'
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [supervisors, setSupervisors] = useState([
    { name: '', email: '', staff_id: '', phone: '' },
  ]);
  const [importResult, setImportResult] = useState(null);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/v1/users/import/supervisors/file', formData, {
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
    mutationFn: (data) => api.post('/v1/users/import/supervisors', { supervisors: data }),
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
  const addSupervisor = () => {
    setSupervisors([...supervisors, { name: '', email: '', staff_id: '', phone: '' }]);
  };

  const removeSupervisor = (index) => {
    if (supervisors.length > 1) {
      setSupervisors(supervisors.filter((_, i) => i !== index));
    }
  };

  const updateSupervisor = (index, field, value) => {
    const newSupervisors = [...supervisors];
    newSupervisors[index][field] = value;
    setSupervisors(newSupervisors);
  };

  const handleManualImport = () => {
    const validSupervisors = supervisors.filter(s => s.name && s.email && s.staff_id);
    if (validSupervisors.length === 0) {
      alert('Please fill in at least one complete supervisor record');
      return;
    }
    importMutation.mutate(validSupervisors);
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,staff_id,phone\nJohn Teacher,john@school.com,STAFF001,08012345678\nJane Supervisor,jane@school.com,STAFF002,08087654321\nBob Administrator,bob@school.com,STAFF003,08098765432';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supervisors_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setImportResult(null);
    setFile(null);
    setPreviewData([]);
    setSupervisors([{ name: '', email: '', staff_id: '', phone: '' }]);
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
          <h1 className="text-2xl font-bold text-gray-900">Import Supervisors</h1>
          <p className="text-gray-600 mt-1">
            Add multiple supervisors/staff via file upload or manual entry
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Upload a CSV or Excel file with supervisor data, or enter manually</li>
          <li>Required fields: Name, Email, Staff ID</li>
          <li>Each supervisor will receive an auto-generated password</li>
          <li>Supervisors can grade exams and manage questions</li>
          <li>Email and Staff ID must be unique</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
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
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <FileSpreadsheet className="mx-auto mb-3 text-green-600" size={48} />
              <p className="font-medium text-gray-900">Upload File</p>
              <p className="text-sm text-gray-600 mt-1">CSV or Excel file</p>
            </button>

            <button
              onClick={() => setImportMode('manual')}
              className={`p-6 border-2 rounded-lg transition-all ${
                importMode === 'manual'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <Upload className="mx-auto mb-3 text-purple-600" size={48} />
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
            Upload Supervisor File
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
                <span className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer inline-flex items-center gap-2">
                  <Upload size={20} />
                  Select File
                </span>
              </label>
            </div>
          ) : (
            <>
              {/* Selected File Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-green-600" size={32} />
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
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Staff ID</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-700">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{row.name || '-'}</td>
                            <td className="px-4 py-2">{row.email || '-'}</td>
                            <td className="px-4 py-2">{row.staff_id || '-'}</td>
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
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing File...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Import Supervisors from File
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
            <h3 className="font-semibold text-gray-900">Supervisor Details</h3>
            <button
              onClick={addSupervisor}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              + Add Another Supervisor
            </button>
          </div>

          <div className="space-y-4">
            {supervisors.map((supervisor, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium text-gray-900">Supervisor #{index + 1}</p>
                  {supervisors.length > 1 && (
                    <button
                      onClick={() => removeSupervisor(index)}
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
                      value={supervisor.name}
                      onChange={(e) => updateSupervisor(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="John Teacher"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={supervisor.email}
                      onChange={(e) => updateSupervisor(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="john@school.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={supervisor.staff_id}
                      onChange={(e) => updateSupervisor(index, 'staff_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="STAFF001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={supervisor.phone}
                      onChange={(e) => updateSupervisor(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
            className="mt-6 w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
          >
            {importMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Import {supervisors.length} Supervisor(s)
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
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-green-600">Total</p>
              <p className="text-2xl font-bold text-green-900">{importResult.total}</p>
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
                {importResult.imported.map((supervisor, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{supervisor.name}</p>
                        <p className="text-sm text-gray-600">{supervisor.email} | {supervisor.staff_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Default Password:</p>
                        <p className="font-mono text-sm font-bold text-green-700">{supervisor.default_password}</p>
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Import More Supervisors
            </button>
            <button
              onClick={() => navigate('/admin/users?role=supervisor')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View All Supervisors
            </button>
          </div>
        </div>
      )}
    </div>
  );
}