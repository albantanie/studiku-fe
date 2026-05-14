import { AlertTriangle, X } from 'lucide-react';

interface DeleteAcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  yearName: string;
}

export function DeleteAcademicYearModal({ isOpen, onClose, onConfirm, yearName }: DeleteAcademicYearModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg text-gray-900 mb-2">Hapus Tahun Akademik</h3>
              <p className="text-sm text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus tahun akademik <span className="font-semibold text-gray-900">"{yearName}"</span>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Peringatan:</strong> Semua data terkait tahun akademik ini akan dihapus secara permanen, termasuk kursus dan data mahasiswa yang terdaftar.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Hapus Tahun Akademik
          </button>
        </div>
      </div>
    </div>
  );
}
