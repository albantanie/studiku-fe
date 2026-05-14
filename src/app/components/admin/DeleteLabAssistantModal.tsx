import { AlertTriangle } from 'lucide-react';

interface DeleteLabAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assistantName: string;
}

export function DeleteLabAssistantModal({ isOpen, onClose, onConfirm, assistantName }: DeleteLabAssistantModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Hapus Asisten Lab</h2>
              <p className="text-sm text-gray-600 mt-1">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Apakah Anda yakin ingin menghapus asisten lab{' '}
              <span className="font-semibold text-gray-900">{assistantName}</span>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Semua data terkait akan dihapus secara permanen.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}