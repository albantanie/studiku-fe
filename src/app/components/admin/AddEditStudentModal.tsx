import { useState, useEffect } from 'react';
import { X, User, Mail, BookOpen, Calendar, GraduationCap, FileText, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '../../../services/api';

interface Student {
  id?: number;
  name: string;
  email: string;
  password: string;
  studentId: string;
  program: string;
  semester: number;
  courses: string[];
  status: string;
  joinDate: string;
}

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEdit: (student: Student) => void;
  student?: Student | null;
  mode: 'add' | 'edit';
}

export function AddEditStudentModal({ isOpen, onClose, onAddEdit, student, mode }: AddEditStudentModalProps) {
  const [formData, setFormData] = useState<Student>({
    name: '',
    email: '',
    password: '',
    studentId: '',
    program: 'Teknik Informatika',
    semester: 1,
    courses: [],
    status: 'Aktif',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (student && mode === 'edit') {
      setFormData(student);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        studentId: '',
        program: 'Teknik Informatika',
        semester: 1,
        courses: [],
        status: 'Aktif',
        joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [student, mode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    api.get<string[]>('/admin/student-programs')
      .then(setPrograms)
      .catch((error) => console.error('Failed to load student programs:', error));
  }, [isOpen]);

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

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'NIM harus diisi';
    }

    if (!formData.program) {
      newErrors.program = 'Program studi harus dipilih';
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

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">
              {mode === 'add' ? 'Tambah Mahasiswa Baru' : 'Edit Data Mahasiswa'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'add' 
                ? 'Lengkapi form di bawah untuk menambahkan mahasiswa baru' 
                : 'Perbarui informasi mahasiswa'
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
                    placeholder="Masukkan nama lengkap"
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
                      placeholder="email@student.ac.id"
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
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Masukkan password"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Informasi Akademik
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student ID */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    NIM <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleChange('studentId', e.target.value)}
                      placeholder="TI2021001"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.studentId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
                </div>

                {/* Program */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Program Studi
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value="Teknik Informatika"
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Tanggal Masuk <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleChange('joinDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
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
            {mode === 'add' ? 'Tambah Mahasiswa' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
