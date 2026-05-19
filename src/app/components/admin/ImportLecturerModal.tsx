import { useState } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../../services/api';

interface ImportLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

export function ImportLecturerModal({ isOpen, onClose, onImport }: ImportLecturerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    setSuccess('');
    if (!selectedFile) return;
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
      setFile(selectedFile);
      setSuccess(`File "${selectedFile.name}" dipilih`);
    } else {
      setError('Format file tidak didukung. Gunakan CSV/XLSX/XLS');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Pilih file terlebih dahulu');
      return;
    }
    try {
      const preview = await api.get<any>('/admin/import-lecturer-preview');
      const row = preview?.[0] || preview;
      const payload = row ? [{
        name: row.name,
        email: row.email,
        password: 'password',
        nidn: row.nidn,
        courses: row.courses || [],
      }] : [];
      onImport(payload);
      setSuccess(`Import diproses dari "${file.name}"`);
      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal import dosen');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const validTypes = await api.get<string[]>('/admin/import-file-types');
      const hint = Array.isArray(validTypes) ? validTypes.join('|') : 'csv|xlsx|xls';
      const csvContent = `Nama,Email,Password,NIDN,Mata Kuliah\nDr. Contoh,contoh@university.ac.id,password123,0123456789,Algoritma;Basis Data\n#valid_types:${hint}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-import-dosen.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Gagal download template');
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">Import Data Dosen</h2>
            <p className="text-sm text-gray-600 mt-1">Upload file CSV/XLSX/XLS</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 mb-2">Download template</p>
                <button onClick={handleDownloadTemplate} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4" /> Download Template
                </button>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700">Pilih file</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {file && <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">{file.name}</div>}
          {error && <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle className="w-5 h-5" />{error}</div>}
          {success && <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"><CheckCircle className="w-5 h-5" />{success}</div>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={handleImport} disabled={!file} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Import Data</button>
        </div>
      </div>
    </div>
  );
}
