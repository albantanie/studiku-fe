import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Clock, BookOpen, Filter, Eye, BarChart3, UserCheck } from 'lucide-react';
import { AddEditCourseModal } from './AddEditCourseModal';
import { DeleteCourseModal } from './DeleteCourseModal';
import { api } from '../../../services/api';

interface Course {
  id: number;
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
  students: number;
}

export function CourseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any[]>('/admin/courses');
        setCourses((data || []).map((c) => ({
          id: c.id,
          name: c.name,
          instructor: c.instructor || '-',
          assistant: c.assistant || '-',
          studyProgram: c.studyProgram || '-',
          academicYear: c.academicYear || '-',
          classCode: c.classCode || '-',
          status: c.status || 'Aktif',
          day: c.day || '-',
          startTime: c.startTime || '-',
          endTime: c.endTime || '-',
          room: c.room || '-',
          sessions: c.sessions || 0,
          credits: c.credits || 0,
          students: c.students || 0,
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat kursus admin');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.classCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedAcademicYear === 'all' || course.academicYear === selectedAcademicYear;
    return matchesSearch && matchesCategory;
  });
  const academicYears = Array.from(new Set(courses.map((c) => c.academicYear).filter(Boolean)));

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCourse = async (courseData: Course) => {
    if (selectedCourse) {
      await api.put(`/admin/courses/${selectedCourse.id}`, courseData);
    } else {
      await api.post('/admin/courses', courseData);
    }
    const data = await api.get<any[]>('/admin/courses');
    setCourses((data || []).map((c) => ({
      id: c.id,
      name: c.name,
      instructor: c.instructor || '-',
      assistant: c.assistant || '-',
      studyProgram: c.studyProgram || '-',
      academicYear: c.academicYear || '-',
      classCode: c.classCode || '-',
      status: c.status || 'Aktif',
      day: c.day || '-',
      startTime: c.startTime || '-',
      endTime: c.endTime || '-',
      room: c.room || '-',
      sessions: c.sessions || 0,
      credits: c.credits || 0,
      students: c.students || 0,
    })));
    setIsAddEditModalOpen(false);
    setSelectedCourse(null);
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      await api.delete(`/admin/courses/${courseToDelete.id}`);
      const data = await api.get<any[]>('/admin/courses');
      setCourses((data || []).map((c) => ({
        id: c.id,
        name: c.name,
        instructor: c.instructor || '-',
        assistant: c.assistant || '-',
        studyProgram: c.studyProgram || '-',
        academicYear: c.academicYear || '-',
        classCode: c.classCode || '-',
        status: c.status || 'Aktif',
        day: c.day || '-',
        startTime: c.startTime || '-',
        endTime: c.endTime || '-',
        room: c.room || '-',
        sessions: c.sessions || 0,
        credits: c.credits || 0,
        students: c.students || 0,
      })));
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  // Statistics
  const stats = [
    {
      label: 'Total Kursus',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      label: 'Kursus Aktif',
      value: courses.filter(c => c.status === 'Aktif').length,
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      label: 'Total Mahasiswa',
      value: courses.reduce((sum, c) => sum + c.students, 0),
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
          <h1 className="text-gray-900">Kelola Kursus</h1>
          <p className="text-gray-600 mt-1">Kelola kursus, materi, dan pengajar</p>
      </div>
      {isLoading && <div className="text-sm text-gray-600">Memuat kursus...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
        <button 
          onClick={handleAddCourse}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Kursus</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kursus berdasarkan nama, kode, atau pengajar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tahun Akademik</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 mb-2">Tidak ada kursus ditemukan</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedAcademicYear !== 'all' 
              ? 'Coba ubah filter atau kata kunci pencarian'
              : 'Mulai dengan menambahkan kursus baru'}
          </p>
          {!searchQuery && selectedAcademicYear === 'all' && (
            <button
              onClick={handleAddCourse}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Kursus Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-base text-gray-900 flex-1">{course.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                        course.status === 'Aktif' 
                          ? 'bg-green-100 text-green-800' 
                          : course.status === 'Draft'
                          ? 'bg-gray-100 text-gray-800'
                          : course.status === 'Selesai'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{course.credits} SKS</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Asisten: {course.assistant}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{course.students} mahasiswa terdaftar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{course.day}, {course.startTime} - {course.endTime}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Kelas: {course.classCode}</span>
                    <span className="text-xs text-gray-500">{course.academicYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600">
            Menampilkan <span className="text-gray-900">{filteredCourses.length}</span> dari <span className="text-gray-900">{courses.length}</span> kursus
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Sebelumnya
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditCourseModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedCourse(null);
        }}
        onSave={handleSaveCourse}
        course={selectedCourse}
      />

      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        courseName={courseToDelete?.name || ''}
        courseCode={courseToDelete?.classCode || ''}
      />
    </div>
  );
}
