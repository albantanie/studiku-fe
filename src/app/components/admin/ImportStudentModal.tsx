import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { api } from '../../../services/api';

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

export function ImportStudentModal({ isOpen, onClose, onImport }: ImportStudentModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx') {
      setErrorMessage('Format file tidak valid. Hanya file .xlsx yang diperbolehkan.');
      setImportStatus('error');
      return;
    }
    setFile(file);
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.postFormData<{ preview: any[]; rows: any[] }>('/admin/students/import/preview', formData);
      setPreviewData(result?.preview || []);
      setImportStatus('preview');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal membaca file. Pastikan format file benar.');
      setImportStatus('error');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.postFormData<{ imported: number; students: any[] }>('/admin/students/import', formData);
      onImport(result?.students || []);
      setImportStatus('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Import gagal.');
      setImportStatus('error');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setImportStatus('idle');
    setErrorMessage('');
    onClose();
  };

  const downloadTemplate = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/admin/students/import/template`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">Import Data Mahasiswa</h2>
            <p className="text-sm text-gray-600 mt-1">Upload file Excel (.xlsx) untuk import data mahasiswa</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {importStatus === 'idle' && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm text-blue-900 mb-1">Butuh template?</h3>
                    <p className="text-sm text-blue-700 mb-3">Download template Excel untuk memastikan format data Anda sesuai.</p>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 mb-2">
                  Drag & drop file di sini atau
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  pilih file
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Format yang didukung: Excel (.xlsx)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>

              {/* Format Guide */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm text-gray-900 mb-3">Format File:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• <strong>nim</strong></p>
                  <p>• <strong>nama</strong></p>
                  <p>• <strong>email</strong></p>
                  <p>• <strong>no_hp</strong></p>
                  <p>• <strong>jenis_kelamin</strong></p>
                  <p>• <strong>program_studi</strong></p>
                  <p>• <strong>angkatan</strong></p>
                  <p>• <strong>status</strong></p>
                </div>
              </div>
            </div>
          )}

          {importStatus === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900">Preview Data</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {previewData.length} mahasiswa akan diimport
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{file?.name}</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Nama</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">NIM</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Program</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Angkatan</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.studentId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.program}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{student.angkatan}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                              student.status === 'Aktif'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">Import Berhasil!</h3>
              <p className="text-gray-600 text-center">
                {previewData.length} mahasiswa berhasil diimport ke sistem
              </p>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-gray-900 mb-2">Import Gagal</h3>
              <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
              <button
                onClick={() => setImportStatus('idle')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {importStatus === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setImportStatus('idle')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Import {previewData.length} Mahasiswa
            </button>
          </div>
        )}

        {importStatus === 'idle' && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
