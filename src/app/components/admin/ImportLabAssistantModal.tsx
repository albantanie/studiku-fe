import { useState } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportLabAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
}

export function ImportLabAssistantModal({ isOpen, onClose, onImport }: ImportLabAssistantModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const parseCsv = async (selectedFile: File) => {
    const text = await selectedFile.text();
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const [name, email, password, studentId, lab, supervisor, semester, gpa, phone, status] = line.split(',').map((v) => v.trim());
      return {
        name,
        email,
        password,
        studentId,
        lab,
        supervisor,
        semester: Number(semester || 1),
        gpa: Number(gpa || 0),
        phone,
        status: status || 'Aktif',
      };
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('Pilih file terlebih dahulu');
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    try {
      setIsImporting(true);
      setError('');
      const rows = await parseCsv(file);
      await onImport(rows);
      setSuccess(`Import ${rows.length} data aslab berhasil`);
      toast.success(`Import ${rows.length} data aslab berhasil`);
      setTimeout(() => {
        setFile(null);
        setSuccess('');
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import gagal');
      toast.error(err instanceof Error ? err.message : 'Import gagal');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'Nama,Email,Password,NIM,Lab,Supervisor,Semester,IPK,No Telepon,Status\nAslab Contoh,aslab@university.ac.id,password123,TI2021001,Laboratorium Pemrograman,Dr. Budi Santoso,7,3.8,08123456789,Aktif';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-aslab.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">Import Data Aslab</h2>
            <p className="text-sm text-gray-600 mt-1">Upload file CSV untuk import data aslab</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700">Pilih file</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  setError('');
                  setSuccess('');
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                }}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Format: CSV</p>
          </div>

          {file && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">{file.name}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
          <button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Mengimport...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
