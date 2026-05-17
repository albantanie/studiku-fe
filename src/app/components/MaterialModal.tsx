import { X, FileText, Video as VideoIcon, File } from 'lucide-react';

interface MaterialModalProps {
  material: {
    id: number;
    title: string;
    type: string;
    size: string;
  };
  onClose: () => void;
}

export function MaterialModal({ material, onClose }: MaterialModalProps) {
  const getFileIcon = (type: string) => {
    if (type.toLowerCase() === 'pdf') return <FileText className="w-6 h-6 text-red-500" />;
    if (type.toLowerCase() === 'video') return <VideoIcon className="w-6 h-6 text-blue-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const renderPreview = () => {
    if (material.type.toLowerCase() === 'pdf') {
      return (
        <div className="w-full h-[500px] bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Preview PDF</p>
            <p className="text-sm text-gray-500 mt-2">{material.title}</p>
          </div>
        </div>
      );
    }

    if (material.type.toLowerCase() === 'video') {
      return (
        <div className="w-full h-[500px] bg-black rounded-lg border border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <VideoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Preview Video</p>
            <p className="text-sm text-gray-500 mt-2">{material.title}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Preview File</p>
          <p className="text-sm text-gray-500 mt-2">{material.title}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileIcon(material.type)}
            </div>
            <div>
              <h3 className="text-gray-900">{material.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{material.type} • {material.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}
