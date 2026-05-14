import { AlertTriangle, X } from 'lucide-react';

interface DeleteLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lecturerName: string;
}

export function DeleteLecturerModal({ isOpen, onClose, onConfirm, lecturerName }: DeleteLecturerModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-gray-900">Konfirmasi Hapus</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus dosen{' '}
            <span className="text-gray-900">{lecturerName}</span>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Tindakan ini tidak dapat dibatalkan dan semua data terkait akan dihapus.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Hapus Dosen
          </button>
        </div>
      </div>
    </div>
  );
}