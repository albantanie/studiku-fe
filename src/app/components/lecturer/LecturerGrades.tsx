import { useEffect, useState } from 'react';
import { Award, Search, Filter, BookOpen, TrendingUp, Users, Eye, Edit2, X } from 'lucide-react';
import { api } from '../../../services/api';

interface Student {
  id: number;
  nim: string;
  name: string;
  tugas1: number;
  tugas2: number;
  tugas3: number;
  ujianAkhir: number;
  nilaiAkhir: number;
  grade: string;
}

interface CourseGrade {
  id: number;
  courseCode: string;
  courseName: string;
  class: string;
  semester: string;
  academicYear: string;
  totalStudents: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
}

export function LecturerGrades() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseGrade | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [gradeForm, setGradeForm] = useState({ tugas1: 0, tugas2: 0, tugas3: 0, ujianAkhir: 0 });

  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);

  const [studentGrades, setStudentGrades] = useState<Student[]>([]);

  useEffect(() => {
    api.get<{ courseGrades: CourseGrade[]; studentGrades: Student[] }>('/lecturer/grades')
      .then((data) => {
        setCourseGrades(data.courseGrades);
        setStudentGrades(data.studentGrades);
      })
      .catch((error) => console.error('Failed to load lecturer grades:', error));
  }, []);

  const filteredCourses = courseGrades.filter(course => {
    const matchesSearch = 
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || course.courseCode === filterCourse;
    
    return matchesSearch && matchesCourse;
  });

  const handleViewDetail = (course: CourseGrade) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setGradeForm({
      tugas1: student.tugas1,
      tugas2: student.tugas2,
      tugas3: student.tugas3,
      ujianAkhir: student.ujianAkhir
    });
  };

  const calculateLetterGrade = (score: number) => {
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };

  const handleSaveStudentGrade = async () => {
    if (!editingStudent) return;
    const nilaiAkhir = Number(((gradeForm.tugas1 + gradeForm.tugas2 + gradeForm.tugas3 + gradeForm.ujianAkhir) / 4).toFixed(1));
    const updated = { ...editingStudent, ...gradeForm, nilaiAkhir, grade: calculateLetterGrade(nilaiAkhir) };
    await api.put(`/lecturer/grades/students/${editingStudent.id}`, updated);
    setStudentGrades(studentGrades.map((student) => student.id === editingStudent.id ? updated : student));
    setEditingStudent(null);
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-700',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-700',
      'D': 'bg-orange-100 text-orange-700',
      'E': 'bg-red-100 text-red-700',
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getGradeDistribution = (students: Student[]) => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    students.forEach(student => {
      distribution[student.grade as keyof typeof distribution]++;
    });
    return distribution;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Nilai Mahasiswa</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau nilai mahasiswa</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Kursus</p>
              <p className="text-3xl font-bold text-gray-900">{courseGrades.length}</p>
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
                {courseGrades.reduce((sum, course) => sum + course.totalStudents, 0)}
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
              <p className="text-sm text-gray-600 mb-1">Rata-rata Nilai</p>
              <p className="text-3xl font-bold text-gray-900">
                {courseGrades.length ? (courseGrades.reduce((sum, course) => sum + course.averageGrade, 0) / courseGrades.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nilai Tertinggi</p>
              <p className="text-3xl font-bold text-green-600">
                {courseGrades.length ? Math.max(...courseGrades.map(c => c.highestGrade)) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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

          {/* Filter Course */}
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">Semua Kursus</option>
                <option value="TIF101">TIF101 - Pemrograman Dasar</option>
                <option value="TIF102">TIF102 - Struktur Data</option>
                <option value="TIF201">TIF201 - Basis Data</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grades */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-gray-900">Daftar Kursus</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Kursus
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Mahasiswa
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Rata-rata
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tertinggi
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Terendah
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {course.courseCode}
                        </span>
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {course.class}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{course.courseName}</p>
                      <p className="text-xs text-gray-500">{course.semester} {course.academicYear}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-900">{course.totalStudents}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                      {course.averageGrade.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      {course.highestGrade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                      {course.lowestGrade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetail(course)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">Tidak ada data nilai</h3>
          <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedCourse.courseCode}
                    </span>
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedCourse.class}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedCourse.courseName}</h2>
                  <p className="text-blue-100 mt-1">{selectedCourse.semester} {selectedCourse.academicYear}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-sm text-blue-100 mb-1">Total Mahasiswa</p>
                  <p className="font-semibold text-2xl">{selectedCourse.totalStudents}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-sm text-blue-100 mb-1">Rata-rata Nilai</p>
                  <p className="font-semibold text-2xl">{selectedCourse.averageGrade.toFixed(1)}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-sm text-blue-100 mb-1">Nilai Tertinggi</p>
                  <p className="font-semibold text-2xl">{selectedCourse.highestGrade}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Grade Distribution */}
              <div className="mb-6">
                <h3 className="text-gray-900 font-semibold mb-3">Distribusi Nilai</h3>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(getGradeDistribution(studentGrades)).map(([grade, count]) => (
                    <div key={grade} className={`rounded-lg p-4 text-center ${getGradeColor(grade)}`}>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs mt-1">Grade {grade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Grades Table */}
              <div className="mb-4">
                <h3 className="text-gray-900 font-semibold">Daftar Nilai Mahasiswa</h3>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIM</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Tugas 1</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Tugas 2</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Tugas 3</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Ujian Akhir</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Nilai Akhir</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Grade</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentGrades.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.nim}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{student.tugas1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{student.tugas2}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{student.tugas3}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{student.ujianAkhir}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                            {student.nilaiAkhir.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getGradeColor(student.grade)}`}>
                            {student.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg text-gray-900">Edit Nilai</h2>
                <p className="text-sm text-gray-600">{editingStudent.name}</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {(['tugas1', 'tugas2', 'tugas3', 'ujianAkhir'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm text-gray-700 mb-1">{field}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeForm[field]}
                    onChange={(e) => setGradeForm({ ...gradeForm, [field]: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setEditingStudent(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleSaveStudentGrade} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Simpan Nilai</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
