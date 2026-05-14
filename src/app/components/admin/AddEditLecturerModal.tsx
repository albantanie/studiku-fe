import { useState, useEffect } from 'react';
import { X, User, Mail, IdCard, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';

interface Lecturer {
  id?: number;
  name: string;
  email: string;
  password: string;
  nidn: string;
  courses: string[];
}

interface AddEditLecturerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEdit: (lecturer: Lecturer) => void;
  lecturer?: Lecturer | null;
  mode: 'add' | 'edit';
}

export function AddEditLecturerModal({ isOpen, onClose, onAddEdit, lecturer, mode }: AddEditLecturerModalProps) {
  const [formData, setFormData] = useState<Lecturer>({
    name: '',
    email: '',
    password: '',
    nidn: '',
    courses: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [courseInput, setCourseInput] = useState('');

  useEffect(() => {
    if (lecturer && mode === 'edit') {
      setFormData(lecturer);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        nidn: '',
        courses: []
      });
    }
    setErrors({});
    setCourseInput('');
  }, [lecturer, mode, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (mode === 'add' && !formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    }

    if (!formData.nidn.trim()) {
      newErrors.nidn = 'NIDN harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddEdit(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof Lecturer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddCourse = () => {
    if (courseInput.trim() && !formData.courses.includes(courseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        courses: [...prev.courses, courseInput.trim()]
      }));
      setCourseInput('');
    }
  };

  const handleRemoveCourse = (course: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c !== course)
    }));
  };

  const handleCourseKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCourse();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">
              {mode === 'add' ? 'Tambah Dosen Baru' : 'Edit Data Dosen'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'add' 
                ? 'Lengkapi form di bawah untuk menambahkan dosen baru' 
                : 'Perbarui informasi dosen'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Informasi Pribadi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Masukkan nama lengkap dengan gelar"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@university.ac.id"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Password {mode === 'add' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={mode === 'edit' ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* NIDN */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    NIDN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nidn}
                      onChange={(e) => handleChange('nidn', e.target.value)}
                      placeholder="0123456789"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.nidn ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.nidn && <p className="text-xs text-red-500 mt-1">{errors.nidn}</p>}
                </div>
              </div>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Mata Kuliah
              </h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Tambah Mata Kuliah
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    onKeyPress={handleCourseKeyPress}
                    placeholder="Nama mata kuliah"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
                
                {formData.courses.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Mata kuliah yang diampu:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                        >
                          {course}
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(course)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {mode === 'add' ? 'Tambah Dosen' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}