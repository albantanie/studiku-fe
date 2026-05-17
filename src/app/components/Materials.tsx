import { useEffect, useState } from 'react';
import { FileText, Video, Eye, Book, File } from 'lucide-react';
import { api } from '../../services/api';
import { MaterialModal } from './MaterialModal';

export function Materials() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);

  const [courses, setCourses] = useState<any[]>([]);

  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ courses: typeof courses; materials: typeof materials }>('/student/materials')
      .then((data) => {
        setCourses(data.courses);
        setMaterials(data.materials);
      })
      .catch((error) => console.error('Failed to load materials:', error));
  }, []);

  const filteredMaterials = materials.filter((material) => {
    if (selectedCourse === 'all') return true;
    return material.courseId === selectedCourse;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-6 h-6 text-white" />;
      case 'pdf':
        return <FileText className="w-6 h-6 text-white" />;
      default:
        return <File className="w-6 h-6 text-white" />;
    }
  };

  const getFileTypeBadge = (type: string) => {
    const styles = {
      video: 'bg-red-100 text-red-700',
      pdf: 'bg-blue-100 text-blue-700',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-1">Materi Pembelajaran</h2>
          <p className="text-gray-500">Akses semua materi dan sumber belajar</p>
        </div>
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{filteredMaterials.length} Materi</span>
        </div>
      </div>

      {/* Course Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCourse === course.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`${material.courseColor} p-6 flex items-center justify-center h-32`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                {getFileIcon(material.type)}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-gray-900 line-clamp-2">{material.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${getFileTypeBadge(material.type)} flex-shrink-0`}>
                  {material.type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{material.courseName}</p>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Ukuran:</span>
                  <span>{material.size}</span>
                </div>
                {material.duration && (
                  <div className="flex items-center justify-between">
                    <span>Durasi:</span>
                    <span>{material.duration}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Diupload:</span>
                  <span>{material.uploadDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Downloads:</span>
                  <span>{material.downloads}x</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMaterial(material)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Lihat</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMaterial && (
        <MaterialModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
    </div>
  );
}
