import { useEffect, useState } from 'react';
import { Search, Award, BookOpen, Users, Filter, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../../services/api';

interface CourseGrade {
  id: number;
  courseName: string;
  courseCode: string;
  className: string;
  semester: string;
  academicYear: string;
  totalStudents: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  passRate: number;
}

interface StudentGrade {
  id: number;
  nim: string;
  name: string;
  tugas1: number;
  tugas2: number;
  tugas3: number;
  finalExam: number;
  finalGrade: number;
  letterGrade: string;
  status: 'Lulus' | 'Tidak Lulus';
}

export function GradeManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseGrade | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);

  const [studentGradesData, setStudentGradesData] = useState<{ [key: number]: StudentGrade[] }>({
    1: [
      { 
        id: 1, 
        nim: '210101001', 
        name: 'Ahmad Fauzi', 
        tugas1: 85, 
        tugas2: 80, 
        tugas3: 82, 
        finalExam: 82, 
        finalGrade: 81.7,
        letterGrade: 'A',
        status: 'Lulus'
      },
      { 
        id: 2, 
        nim: '210101002', 
        name: 'Siti Nurhaliza', 
        tugas1: 92, 
        tugas2: 88, 
        tugas3: 90, 
        finalExam: 90, 
        finalGrade: 90.0,
        letterGrade: 'A',
        status: 'Lulus'
      },
      { 
        id: 3, 
        nim: '210101003', 
        name: 'Budi Setiawan', 
        tugas1: 75, 
        tugas2: 70, 
        tugas3: 68, 
        finalExam: 68, 
        finalGrade: 71.0,
        letterGrade: 'B',
        status: 'Lulus'
      },
      { 
        id: 4, 
        nim: '210101004', 
        name: 'Dewi Kartika', 
        tugas1: 58, 
        tugas2: 52, 
        tugas3: 55, 
        finalExam: 55, 
        finalGrade: 55.0,
        letterGrade: 'D',
        status: 'Tidak Lulus'
      },
      { 
        id: 5, 
        nim: '210101005', 
        name: 'Eko Prasetyo', 
        tugas1: 88, 
        tugas2: 82, 
        tugas3: 85, 
        finalExam: 85, 
        finalGrade: 85.0,
        letterGrade: 'A',
        status: 'Lulus'
      },
    ],
  });

  useEffect(() => {
    api.get<{ courseGrades: CourseGrade[]; studentGradesData: { [key: number]: StudentGrade[] } }>('/admin/grades')
      .then((data) => {
        setCourseGrades(data.courseGrades);
        setStudentGradesData(data.studentGradesData);
      })
      .catch((error) => console.error('Failed to load admin grades:', error));
  }, []);

  const filteredCourses = courseGrades.filter(course => {
    const matchesSearch = 
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || course.courseCode === filterCourse;
    const matchesAcademicYear = filterAcademicYear === 'all' || course.academicYear === filterAcademicYear;
    
    return matchesSearch && matchesCourse && matchesAcademicYear;
  });

  // Get unique course codes and academic years for filters
  const uniqueCourses = Array.from(new Set(courseGrades.map(c => c.courseCode)))
    .map(code => courseGrades.find(c => c.courseCode === code)!);
  
  const uniqueAcademicYears = Array.from(new Set(courseGrades.map(c => c.academicYear)));

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return 'text-green-600';
    if (grade >= 70) return 'text-blue-600';
    if (grade >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLetterGradeBadge = (letterGrade: string) => {
    switch (letterGrade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
      case 'E':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'Lulus' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (selectedCourse) {
    const studentGrades = studentGradesData[selectedCourse.id] || [];
    
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Kembali ke Daftar Nilai</span>
        </button>

        {/* Course Detail Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">{selectedCourse.courseCode}</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{selectedCourse.courseName}</h2>
          <p className="text-blue-100 mb-4">{selectedCourse.className} - {selectedCourse.semester} {selectedCourse.academicYear}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Grade Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 font-semibold mb-4">Distribusi Nilai</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {studentGrades.filter(s => s.letterGrade === 'A').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Grade A</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {studentGrades.filter(s => s.letterGrade === 'B').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Grade B</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {studentGrades.filter(s => s.letterGrade === 'C').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Grade C</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {studentGrades.filter(s => s.letterGrade === 'D').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Grade D</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {studentGrades.filter(s => s.letterGrade === 'E').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Grade E</p>
            </div>
          </div>
        </div>

        {/* Student Grades Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg text-gray-900 font-semibold">Detail Nilai Mahasiswa</h3>
            
            {/* Search Student */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIM mahasiswa..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
            </div>
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
                    Nama Mahasiswa
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tugas 1
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tugas 2
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tugas 3
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Ujian Akhir
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nilai Akhir
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentGrades
                  .filter(student => 
                    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                    student.nim.toLowerCase().includes(studentSearchQuery.toLowerCase())
                  )
                  .map((student, index) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-medium ${getGradeColor(student.tugas1)}`}>
                        {student.tugas1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-medium ${getGradeColor(student.tugas2)}`}>
                        {student.tugas2}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-medium ${getGradeColor(student.tugas3)}`}>
                        {student.tugas3}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-medium ${getGradeColor(student.finalExam)}`}>
                        {student.finalExam}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${getGradeColor(student.finalGrade)}`}>
                        {student.finalGrade.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 rounded text-sm font-bold ${getLetterGradeBadge(student.letterGrade)}`}>
                        {student.letterGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusBadge(student.status)}`}>
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
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Nilai</h1>
        <p className="text-gray-600 mt-1">Kelola nilai mahasiswa per kursus</p>
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
                {(courseGrades.reduce((sum, course) => sum + course.averageGrade, 0) / courseGrades.length).toFixed(1)}
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
              <p className="text-sm text-gray-600 mb-1">Rata-rata Kelulusan</p>
              <p className="text-3xl font-bold text-gray-900">
                {(courseGrades.reduce((sum, course) => sum + course.passRate, 0) / courseGrades.length).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kursus, kode, atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Course Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Kursus</option>
              {uniqueCourses.map(course => (
                <option key={course.courseCode} value={course.courseCode}>{course.courseName}</option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filterAcademicYear}
              onChange={(e) => setFilterAcademicYear(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tahun Akademik</option>
              {uniqueAcademicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grades Table */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 mb-2">Tidak ada data nilai ditemukan</h3>
          <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kode Kursus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nama Kursus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tahun Akademik
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{course.courseCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{course.courseName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{course.className}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{course.academicYear}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900">{course.totalStudents}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-medium ${getGradeColor(course.averageGrade)}`}>
                        {course.averageGrade.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {course.highestGrade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          {course.lowestGrade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
