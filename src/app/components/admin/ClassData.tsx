import { useEffect, useState } from 'react';
import { Search, Database, Users, BookOpen, Calendar, ChevronRight, Eye, Plus, Upload, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../../services/api';

interface Class {
  id: number;
  code: string;
  name: string;
  academicYear: string;
  assistant: string;
  schedule: string;
  room: string;
  totalStudents: number;
  capacity: number;
  students: number[]; // Array of student IDs
}

interface Student {
  id: number;
  nim: string;
  name: string;
  email: string;
  status: string;
}

interface ClassFormData {
  name: string;
  code: string;
  academicYear: string;
  capacity: string;
  students: number[];
}

export function ClassData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [classData, setClassData] = useState<Class[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    code: '',
    academicYear: '',
    capacity: '',
    students: []
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [classes, students] = await Promise.all([
          api.get<any[]>('/admin/classes'),
          api.get<any[]>('/admin/students'),
        ]);
        setClassData((classes || []).map((cls) => ({
          id: cls.id,
          code: cls.code || '-',
          name: cls.name || '-',
          academicYear: cls.academicYear || '-',
          assistant: cls.assistant || '-',
          schedule: cls.schedule || '-',
          room: cls.room || '-',
          totalStudents: cls.totalStudents || 0,
          capacity: cls.capacity || 0,
          students: cls.students || [],
        })));
        setAllStudents((students || []).map((s) => ({
          id: s.id,
          nim: s.studentId || s.nim || '-',
          name: s.name || '-',
          email: s.email || '-',
          status: s.status || 'Aktif',
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data kelas');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredClasses = classData.filter(cls => {
    const matchesSearch = 
      cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.assistant.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAcademicYear = filterAcademicYear === 'all' || cls.academicYear === filterAcademicYear;
    
    return matchesSearch && matchesAcademicYear;
  });
  const academicYears = Array.from(new Set(classData.map((c) => c.academicYear).filter(Boolean)));

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      code: '',
      academicYear: '',
      capacity: '',
      students: []
    });
    setShowAddModal(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      code: cls.code,
      academicYear: cls.academicYear,
      capacity: cls.capacity.toString(),
      students: cls.students
    });
    setShowAddModal(true);
  };

  const handleDeleteClass = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;
    await api.delete(`/admin/classes/${id}`);
    const classes = await api.get<any[]>('/admin/classes');
    setClassData((classes || []).map((cls) => ({
      id: cls.id,
      code: cls.code || '-',
      name: cls.name || '-',
      academicYear: cls.academicYear || '-',
      assistant: cls.assistant || '-',
      schedule: cls.schedule || '-',
      room: cls.room || '-',
      totalStudents: cls.totalStudents || 0,
      capacity: cls.capacity || 0,
      students: cls.students || [],
    })));
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      code: formData.code,
      academicYear: formData.academicYear,
      assistant: editingClass?.assistant || '',
      schedule: editingClass?.schedule || '',
      room: editingClass?.room || '',
      totalStudents: formData.students.length,
      capacity: parseInt(formData.capacity),
      students: formData.students,
    };

    if (editingClass) {
      await api.put(`/admin/classes/${editingClass.id}`, payload);
    } else {
      await api.post('/admin/classes', payload);
    }
    const classes = await api.get<any[]>('/admin/classes');
    setClassData((classes || []).map((cls) => ({
      id: cls.id,
      code: cls.code || '-',
      name: cls.name || '-',
      academicYear: cls.academicYear || '-',
      assistant: cls.assistant || '-',
      schedule: cls.schedule || '-',
      room: cls.room || '-',
      totalStudents: cls.totalStudents || 0,
      capacity: cls.capacity || 0,
      students: cls.students || [],
    })));
    setShowAddModal(false);
  };

  const handleStudentToggle = (studentId: number) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.includes(studentId)
        ? prev.students.filter(id => id !== studentId)
        : [...prev.students, studentId]
    }));
  };

  if (selectedClass) {
    const students = allStudents.filter(s => selectedClass.students.includes(s.id));
    
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedClass(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Kembali ke Daftar Kelas</span>
        </button>

        {/* Class Detail Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">{selectedClass.code}</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">{selectedClass.name}</h2>
          
          <div className="max-w-xs">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Kapasitas</p>
              <p className="font-semibold">{selectedClass.totalStudents} / {selectedClass.capacity} Mahasiswa</p>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg text-gray-900 font-semibold">Daftar Mahasiswa ({students.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    NIM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {student.nim}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && <div className="text-sm text-gray-600">Memuat data kelas...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900">Data Kelas</h1>
          <p className="text-gray-600 mt-1">Kelola informasi kelas dan daftar mahasiswa</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Import Data</span>
          </button>
          <button
            onClick={handleAddClass}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Kelas</p>
              <p className="text-3xl font-bold text-gray-900">{classData.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Mahasiswa</p>
              <p className="text-3xl font-bold text-gray-900">
                {classData.reduce((sum, cls) => sum + cls.totalStudents, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelas, kode, atau asisten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-2 md:w-64">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tahun Akademik</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Class List */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 mb-2">Tidak ada kelas ditemukan</h3>
          <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nama Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kode Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kapasitas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{cls.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                        {cls.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getCapacityColor(cls.totalStudents, cls.capacity)}`}>
                        {cls.totalStudents} / {cls.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClass(cls)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClass(cls)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl text-gray-900 font-semibold">
                {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitClass} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Pemrograman Dasar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Kelas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: A1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapasitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Jumlah kapasitas maksimal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Akademik <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Tahun Akademik</option>
                    {academicYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Mahasiswa
                </label>
                
                {/* Search Student */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau NIM..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  {allStudents
                    .filter(student => 
                      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                      student.nim.toLowerCase().includes(studentSearchQuery.toLowerCase())
                    )
                    .map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={formData.students.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">{student.name}</p>
                          <p className="text-xs text-gray-600">{student.nim}</p>
                        </div>
                      </label>
                    ))
                  }
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {formData.students.length} mahasiswa dipilih
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Data Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl text-gray-900 font-semibold">Import Data Kelas</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop file Excel atau klik untuk browse
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                >
                  Pilih File
                </label>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Format file:</span>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>File Excel (.xlsx, .xls) atau CSV</li>
                  <li>Kolom: Nama Kelas, Kode, Asisten, Jadwal, Ruangan, Kapasitas</li>
                  <li>Maksimal 100 baris data</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
