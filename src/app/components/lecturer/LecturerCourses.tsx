import { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Clock, Search, Filter, Plus, Edit2, Trash2, FileText, Award, X, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';

interface Course {
  id: number;
  code: string;
  name: string;
  class: string;
  semester: string;
  academicYear: string;
  students: number;
  schedule: string;
  room: string;
  sks: number;
  description: string;
  materials: number;
  assignments: number;
}

export function LecturerCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.get<Course[]>('/lecturer/courses')
      .then(setCourses)
      .catch((error) => console.error('Failed to load lecturer courses:', error));
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    
    return matchesSearch && matchesSemester;
  });

  const handleViewDetail = (course: Course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const emptyCourse: Course = {
    id: 0,
    code: '',
    name: '',
    class: '',
    semester: 'Ganjil',
    academicYear: '2024/2025',
    students: 0,
    schedule: '',
    room: '',
    sks: 3,
    description: '',
    materials: 0,
    assignments: 0
  };

  const [courseForm, setCourseForm] = useState<Course>(emptyCourse);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseForm(emptyCourse);
    setShowAddModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm(course);
    setShowAddModal(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map((course) => course.id === editingCourse.id ? { ...courseForm, id: editingCourse.id } : course));
    } else {
      const nextId = courses.length ? Math.max(...courses.map((course) => course.id)) + 1 : 1;
      setCourses([...courses, { ...courseForm, id: nextId }]);
    }
    setShowAddModal(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!courseToDelete) return;
    setCourses(courses.filter((course) => course.id !== courseToDelete.id));
    setCourseToDelete(null);
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Kursus Saya</h1>
        <p className="text-gray-600 mt-1">Kelola mata kuliah yang Anda ampu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Kursus</p>
              <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Mahasiswa</p>
              <p className="text-3xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.students, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Materi</p>
              <p className="text-3xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.materials, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tugas</p>
              <p className="text-3xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.assignments, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari kursus, kode, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Semester */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">Semua Semester</option>
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddCourse}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Tambah Kursus
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-4 text-white">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                    {course.code}
                  </span>
                  <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                    {course.class}
                  </span>
                </div>
                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
                  {course.sks} SKS
                </span>
              </div>
              <h3 className="font-bold mb-1">{course.name}</h3>
              <p className="text-sm text-blue-100">{course.semester} {course.academicYear}</p>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{course.room}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{course.students} Mahasiswa</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Materi</p>
                  <p className="text-lg font-bold text-blue-600">{course.materials}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">Tugas</p>
                  <p className="text-lg font-bold text-purple-600">{course.assignments}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetail(course)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Lihat Detail
                </button>
                <button
                  onClick={() => handleEditCourse(course)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">Tidak ada kursus ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedCourse.code}
                    </span>
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedCourse.class}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedCourse.name}</h2>
                  <p className="text-blue-100 mt-1">{selectedCourse.semester} {selectedCourse.academicYear}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Course Info */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-3">Informasi Kursus</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kode Mata Kuliah</p>
                    <p className="text-gray-900 font-medium">{selectedCourse.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SKS</p>
                    <p className="text-gray-900 font-medium">{selectedCourse.sks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Kelas</p>
                    <p className="text-gray-900 font-medium">{selectedCourse.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jumlah Mahasiswa</p>
                    <p className="text-gray-900 font-medium">{selectedCourse.students} orang</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jadwal</p>
                    <p className="text-gray-900 font-medium">{selectedCourse.schedule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ruangan</p>
                    <p className="text-gray-900 font-medium">{selectedCourse.room}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-2">Deskripsi</h3>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-3">Statistik</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{selectedCourse.materials}</p>
                    <p className="text-xs text-gray-600 mt-1">Materi</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{selectedCourse.assignments}</p>
                    <p className="text-xs text-gray-600 mt-1">Tugas</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{selectedCourse.students}</p>
                    <p className="text-xs text-gray-600 mt-1">Mahasiswa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditCourse(selectedCourse);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Edit Kursus
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl text-gray-900">{editingCourse ? 'Edit Kursus' : 'Tambah Kursus'}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} placeholder="Kode" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input required value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Nama kursus" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input required value={courseForm.class} onChange={(e) => setCourseForm({ ...courseForm, class: e.target.value })} placeholder="Kelas" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input required value={courseForm.schedule} onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })} placeholder="Jadwal" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input required value={courseForm.room} onChange={(e) => setCourseForm({ ...courseForm, room: e.target.value })} placeholder="Ruangan" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input type="number" min="1" required value={courseForm.sks} onChange={(e) => setCourseForm({ ...courseForm, sks: parseInt(e.target.value) || 1 })} placeholder="SKS" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <textarea required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Deskripsi" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-gray-900 mb-2">Hapus Kursus</h3>
                <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus kursus <span className="font-semibold text-gray-900">"{courseToDelete?.name}"</span>?</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleConfirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Hapus Kursus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
