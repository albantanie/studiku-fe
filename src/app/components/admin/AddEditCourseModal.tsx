import { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, FileText } from 'lucide-react';
import { api } from '../../../services/api';

interface Course {
  id?: number;
  name: string;
  instructor: string;
  assistant: string;
  studyProgram: string;
  academicYear: string;
  classCode: string;
  status: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  sessions: number;
  credits: number;
  students?: number;
}

interface AddEditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course?: Course | null;
}

export function AddEditCourseModal({ isOpen, onClose, onSave, course }: AddEditCourseModalProps) {
  const [dosenList, setDosenList] = useState<string[]>([]);
  const [asistenList, setAsistenList] = useState<string[]>([]);
  const [kelasList, setKelasList] = useState<Array<{ code: string; name: string }>>([]);

  const [formData, setFormData] = useState<Course>({
    name: '',
    instructor: '',
    assistant: '',
    studyProgram: 'Teknik Informatika',
    academicYear: '2024/2025',
    classCode: '',
    status: 'Aktif',
    day: 'Senin',
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    sessions: 14,
    credits: 3
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<any>('/admin/course-form-options')
      .then((data) => {
        setDosenList(data?.dosenList || []);
        setAsistenList(data?.asistenList || []);
        setKelasList(data?.kelasList || []);
      })
      .catch(() => {
        setDosenList([]);
        setAsistenList([]);
        setKelasList([]);
      });
  }, []);

  useEffect(() => {
    if (course) {
      setFormData({
        ...course,
        credits: course.credits || 3,
        academicYear: course.academicYear || '2024/2025',
        room: course.room || '',
        startTime: course.startTime || '08:00',
        endTime: course.endTime || '10:00'
      });
    } else {
      setFormData({
        name: '',
        instructor: '',
        assistant: '',
        studyProgram: 'Teknik Informatika',
        academicYear: '2024/2025',
        classCode: '',
        status: 'Aktif',
        day: 'Senin',
        startTime: '08:00',
        endTime: '10:00',
        room: '',
        sessions: 14,
        credits: 3
      });
    }
    setErrors({});
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sessions' || name === 'credits' ? parseInt(value) || 0 : value
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

    if (!formData.name.trim()) newErrors.name = 'Nama kursus wajib diisi';
    if (!formData.instructor.trim()) newErrors.instructor = 'Nama pengajar wajib diisi';
    if (!formData.assistant.trim()) newErrors.assistant = 'Nama asisten wajib diisi';
    if (!formData.studyProgram.trim()) newErrors.studyProgram = 'Program studi wajib diisi';
    if (!formData.academicYear.trim()) newErrors.academicYear = 'Tahun akademik wajib diisi';
    if (!formData.classCode.trim()) newErrors.classCode = 'Kode kelas wajib diisi';
    if (!formData.room.trim()) newErrors.room = 'Ruangan wajib diisi';
    if (formData.sessions <= 0) newErrors.sessions = 'Jumlah sesi harus lebih dari 0';
    if (formData.credits <= 0) newErrors.credits = 'Jumlah SKS harus lebih dari 0';

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
      instructor: '',
      assistant: '',
      studyProgram: 'Teknik Informatika',
      academicYear: '2024/2025',
      classCode: '',
      status: 'Aktif',
      day: 'Senin',
      startTime: '08:00',
      endTime: '10:00',
      room: '',
      sessions: 14,
      credits: 3
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">{course ? 'Edit Kursus' : 'Tambah Kursus Baru'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {course ? 'Perbarui informasi kursus' : 'Isi formulir untuk menambah kursus baru'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Nama Kursus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Pemrograman Web"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Dosen <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Dosen</option>
                    {dosenList.map((dosen) => (
                      <option key={dosen} value={dosen}>{dosen}</option>
                    ))}
                  </select>
                  {errors.instructor && <p className="text-xs text-red-500 mt-1">{errors.instructor}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Asisten <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assistant"
                    value={formData.assistant}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Asisten</option>
                    {asistenList.map((asisten) => (
                      <option key={asisten} value={asisten}>{asisten}</option>
                    ))}
                  </select>
                  {errors.assistant && <p className="text-xs text-red-500 mt-1">{errors.assistant}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="studyProgram"
                    value={formData.studyProgram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Sistem Informasi">Sistem Informasi</option>
                    <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Tahun Akademik <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                    <option value="2027/2028">2027/2028</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Kode Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classCode"
                    value={formData.classCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Kode Kelas</option>
                    {kelasList.map((kelas) => (
                      <option key={kelas.code} value={kelas.code}>{kelas.name}</option>
                    ))}
                  </select>
                  {errors.classCode && <p className="text-xs text-red-500 mt-1">{errors.classCode}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Draft">Draft</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditunda">Ditunda</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule & Duration */}
            <div>
              <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Jadwal & Durasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Hari <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                    <option value="Minggu">Minggu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Waktu Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Waktu Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    placeholder="Contoh: Lab Komputer 1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.room ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.room && <p className="text-xs text-red-500 mt-1">{errors.room}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Jumlah Sesi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="sessions"
                    value={formData.sessions}
                    onChange={handleChange}
                    min="1"
                    placeholder="Contoh: 14"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.sessions ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sessions && <p className="text-xs text-red-500 mt-1">{errors.sessions}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    SKS <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1 SKS</option>
                    <option value="2">2 SKS</option>
                    <option value="3">3 SKS</option>
                    <option value="4">4 SKS</option>
                  </select>
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
              {course ? 'Simpan Perubahan' : 'Tambah Kursus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
