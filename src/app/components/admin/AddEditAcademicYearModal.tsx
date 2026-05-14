import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface AcademicYear {
  name: string;
  startDate: string;
  endDate: string;
  semester: string;
  status: 'Aktif' | 'Selesai' | 'Mendatang';
}

interface AddEditAcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (year: Omit<AcademicYear, 'status'>) => void;
  academicYear?: AcademicYear | null;
}

export function AddEditAcademicYearModal({ isOpen, onClose, onSave, academicYear }: AddEditAcademicYearModalProps) {
  const [formData, setFormData] = useState<Omit<AcademicYear, 'status'>>({
    name: '',
    startDate: '',
    endDate: '',
    semester: 'Ganjil'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (academicYear) {
      setFormData({
        name: academicYear.name,
        startDate: academicYear.startDate,
        endDate: academicYear.endDate,
        semester: academicYear.semester
      });
    } else {
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        semester: 'Ganjil'
      });
    }
    setErrors({});
  }, [academicYear, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama tahun akademik wajib diisi';
    if (!formData.startDate) newErrors.startDate = 'Tanggal mulai wajib diisi';
    if (!formData.endDate) newErrors.endDate = 'Tanggal selesai wajib diisi';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'Tanggal selesai harus setelah tanggal mulai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      semester: 'Ganjil'
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">{academicYear ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {academicYear ? 'Perbarui informasi tahun akademik' : 'Isi formulir untuk menambah tahun akademik baru'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Nama Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: 2024/2025 Ganjil"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Informasi:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Status akan ditentukan otomatis berdasarkan tanggal</li>
                    <li>• <strong>Mendatang:</strong> Tanggal mulai belum tiba</li>
                    <li>• <strong>Aktif:</strong> Berada dalam periode tanggal mulai - selesai</li>
                    <li>• <strong>Selesai:</strong> Tanggal selesai sudah lewat</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {academicYear ? 'Simpan Perubahan' : 'Tambah Tahun Akademik'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}