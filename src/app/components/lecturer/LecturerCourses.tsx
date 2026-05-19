import { useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Clock, Search, Filter, FileText, Award, X, CheckCircle, AlertCircle, XCircle, ArrowLeft, Download, Eye } from 'lucide-react';
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

interface Session {
  id: number;
  sessionNumber: number;
  date: string;
  time: string;
  topic: string;
  room: string;
  status: 'Selesai' | 'Berlangsung' | 'Dijadwalkan';
  presentCount: number;
  excusedCount: number;
  absentCount: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  maxScore: number;
  submitted: number;
  totalStudents: number;
  status: 'Aktif' | 'Ditutup' | 'Dijadwalkan';
}

interface Material {
  id: number;
  name: string;
  type: 'PDF' | 'PPT' | 'Video' | 'Document';
  size: string;
  uploadedAt: string;
}

interface StudentAttendance {
  no: number;
  nim: string;
  name: string;
  status: 'Hadir' | 'Izin' | 'Tidak Hadir';
}

interface StudentSubmission {
  no: number;
  nim: string;
  name: string;
  submittedAt: string;
  fileName: string;
  fileSize: string;
  score: number | null;
  feedback: string;
  status: 'Dinilai' | 'Belum Dinilai' | 'Belum Mengumpulkan';
}

type ViewState =
  | { type: 'list' }
  | { type: 'detail'; courseId: number }
  | { type: 'session-detail'; courseId: number; sessionId: number }
  | { type: 'assignment-detail'; courseId: number; assignmentId: number };

export function LecturerCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [detailTab, setDetailTab] = useState<'sessions' | 'assignments'>('sessions');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any[]>('/admin/courses');
        setCourses((data || []).map((c) => ({
          id: c.id,
          code: c.classCode || c.code || '-',
          name: c.name,
          class: c.classCode || '-',
          semester: 'Ganjil',
          academicYear: c.academicYear || '-',
          students: c.students || 0,
          schedule: `${c.day || '-'}, ${c.startTime || '-'} - ${c.endTime || '-'}`,
          room: c.room || '-',
          sks: c.credits || 0,
          description: c.name || '',
          materials: 0,
          assignments: 0,
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat kursus dosen');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const sessionsData: Session[] = [];

  const assignmentsData: Assignment[] = [];

  const materialsData: Material[] = [];

  const studentAttendanceData: StudentAttendance[] = [];

  const studentSubmissionsData: StudentSubmission[] = [];

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.class.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;

    return matchesSearch && matchesSemester;
  });

  const renderCourseList = () => (
    <div className="space-y-6">
      {isLoading && <div className="text-sm text-gray-600">Memuat kursus...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Kursus</h1>
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
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
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

              <button
                onClick={() => {
                  setViewState({ type: 'detail', courseId: course.id });
                  setDetailTab('sessions');
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Lihat Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">Tidak ada kursus ditemukan</h3>
          <p className="text-gray-600 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
        </div>
      )}
    </div>
  );

  const renderCourseDetail = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setViewState({ type: 'list' })}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Kursus
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
              {course.code}
            </span>
            <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
              {course.class}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{course.name}</h2>
          <p className="text-blue-100 mt-1">{course.semester} {course.academicYear}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setDetailTab('sessions')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  detailTab === 'sessions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sesi Kursus
              </button>
              <button
                onClick={() => setDetailTab('assignments')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  detailTab === 'assignments'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tugas
              </button>
            </div>
          </div>

          <div className="p-6">
            {detailTab === 'sessions' ? (
              <div className="space-y-4">
                <h3 className="text-gray-900 font-semibold">Daftar Sesi Perkuliahan</h3>
                <div className="space-y-3">
                  {sessionsData.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{session.sessionNumber}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-gray-900 font-medium">{session.topic}</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {session.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {session.time}
                              </div>
                              <span>• {session.room}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            session.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                            session.status === 'Berlangsung' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {session.status}
                          </span>
                          {session.status !== 'Dijadwalkan' && (
                            <button
                              onClick={() => setViewState({ type: 'session-detail', courseId, sessionId: session.id })}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Detail
                            </button>
                          )}
                        </div>
                      </div>
                      {session.status !== 'Dijadwalkan' && (
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Hadir:</span>
                            <span className="font-medium text-gray-900">{session.presentCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-gray-600">Izin:</span>
                            <span className="font-medium text-gray-900">{session.excusedCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-gray-600">Tidak Hadir:</span>
                            <span className="font-medium text-gray-900">{session.absentCount}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-gray-900 font-semibold">Daftar Tugas</h3>
                <div className="space-y-3">
                  {assignmentsData.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-gray-900 font-medium">{assignment.title}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              assignment.status === 'Aktif' ? 'bg-green-100 text-green-700' :
                              assignment.status === 'Ditutup' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {assignment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Deadline: {assignment.deadline}</span>
                            </div>
                            <span>• Nilai Max: {assignment.maxScore}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewState({ type: 'assignment-detail', courseId, assignmentId: assignment.id })}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1 ml-4"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Pengumpulan: <span className="font-medium text-gray-900">{assignment.submitted}/{assignment.totalStudents}</span> mahasiswa
                          </div>
                          <div className="text-sm font-medium text-blue-600">
                            {((assignment.submitted / assignment.totalStudents) * 100).toFixed(1)}% terkumpul
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(assignment.submitted / assignment.totalStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSessionDetail = (courseId: number, sessionId: number) => {
    const course = courses.find(c => c.id === courseId);
    const session = sessionsData.find(s => s.id === sessionId);
    if (!course || !session) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setViewState({ type: 'detail', courseId })}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Detail Kursus
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
            Sesi {session.sessionNumber}
          </div>
          <h1 className="text-2xl font-bold mb-1">{session.topic}</h1>
          <p className="text-blue-100 mb-4">{course.name} - {course.code}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Tanggal</p>
              <p className="font-bold">{session.date}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Waktu</p>
              <p className="font-bold">{session.time}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Ruangan</p>
              <p className="font-bold">{session.room}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Status</p>
              <p className="font-bold">{session.status}</p>
            </div>
          </div>
        </div>

        {/* Materi Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Materi Perkuliahan</h2>
          <div className="space-y-3">
            {materialsData.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    material.type === 'PDF' ? 'bg-red-100' :
                    material.type === 'PPT' ? 'bg-orange-100' :
                    material.type === 'Video' ? 'bg-purple-100' :
                    'bg-blue-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      material.type === 'PDF' ? 'text-red-600' :
                      material.type === 'PPT' ? 'text-orange-600' :
                      material.type === 'Video' ? 'text-purple-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{material.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{material.size}</span>
                      <span>•</span>
                      <span>Diunggah {material.uploadedAt}</span>
                    </div>
                  </div>
                </div>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Presensi Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Detail Presensi Mahasiswa</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nama Mahasiswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAttendanceData.map((student) => (
                  <tr key={student.no} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.no}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        student.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                        student.status === 'Izin' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status === 'Hadir' && <CheckCircle className="w-3 h-3" />}
                        {student.status === 'Izin' && <AlertCircle className="w-3 h-3" />}
                        {student.status === 'Tidak Hadir' && <XCircle className="w-3 h-3" />}
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
  };

  const renderAssignmentDetail = (courseId: number, assignmentId: number) => {
    const course = courses.find(c => c.id === courseId);
    const assignment = assignmentsData.find(a => a.id === assignmentId);
    if (!course || !assignment) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setViewState({ type: 'detail', courseId })}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Detail Kursus
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">{assignment.title}</h1>
          <p className="text-blue-100 mb-4">{course.name} - {course.code}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Deadline</p>
              <p className="font-bold">{assignment.deadline}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Nilai Maksimal</p>
              <p className="font-bold">{assignment.maxScore}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-100 mb-1">Status</p>
              <p className="font-bold">{assignment.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Deskripsi Tugas</h2>
          <p className="text-gray-600">{assignment.description}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Daftar Pengumpulan & Nilai</h2>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{assignment.submitted}/{assignment.totalStudents}</span> mahasiswa mengumpulkan
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">NIM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nama Mahasiswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Waktu Submit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentSubmissionsData.map((submission) => (
                  <tr key={submission.no} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{submission.no}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{submission.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{submission.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {submission.submittedAt || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {submission.fileName ? (
                        <div>
                          <p className="text-sm text-gray-900">{submission.fileName}</p>
                          <p className="text-xs text-gray-500">{submission.fileSize}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {submission.score !== null ? (
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                          {submission.score}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {submission.feedback || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        submission.status === 'Dinilai' ? 'bg-green-100 text-green-700' :
                        submission.status === 'Belum Dinilai' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {submission.status}
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
  };

  return (
    <div>
      {viewState.type === 'list' && renderCourseList()}
      {viewState.type === 'detail' && renderCourseDetail(viewState.courseId)}
      {viewState.type === 'session-detail' && renderSessionDetail(viewState.courseId, viewState.sessionId)}
      {viewState.type === 'assignment-detail' && renderAssignmentDetail(viewState.courseId, viewState.assignmentId)}
    </div>
  );
}
