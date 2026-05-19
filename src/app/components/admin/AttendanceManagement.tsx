import { useEffect, useState } from 'react';
import { Search, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, Filter, Eye, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { api } from '../../../services/api';

interface Course {
  id: number;
  name: string;
  code: string;
  class: string;
  instructor: string;
  assistant: string;
  totalSessions: number;
  completedSessions: number;
  totalStudents: number;
}

interface Session {
  id: number;
  courseId: number;
  sessionNumber: number;
  date: string;
  time: string;
  topic: string;
  present: number;
  absent: number;
  excused: number;
  totalStudents: number;
  status: 'Selesai' | 'Berlangsung' | 'Dijadwalkan';
  assistantStatus: 'Hadir' | 'Tidak Hadir' | 'Izin';
  assistantCheckInTime?: string;
}

interface StudentAttendance {
  id: number;
  nim: string;
  name: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Izin';
  checkInTime?: string;
}

export function AttendanceManagement() {
  const [view, setView] = useState<'courses' | 'sessions' | 'detail'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<{ [key: number]: Session[] }>({});
  const [studentAttendanceData, setStudentAttendanceData] = useState<{ [key: number]: StudentAttendance[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const payload = await api.get<any>('/admin/attendance');
        setCourses(payload?.courses || []);
        setSessions(payload?.sessions || {});
        setStudentAttendanceData(payload?.studentAttendanceData || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data presensi');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-gray-100 text-gray-800';
      case 'Berlangsung':
        return 'bg-green-100 text-green-800';
      case 'Dijadwalkan':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'Hadir':
        return 'bg-green-100 text-green-800';
      case 'Tidak Hadir':
        return 'bg-red-100 text-red-800';
      case 'Izin':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'Hadir':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Tidak Hadir':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Izin':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  // View 1: List Kursus
  if (view === 'courses') {
    const filteredCourses = courses.filter(course =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.assistant.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {isLoading && <div className="text-sm text-gray-600">Memuat presensi...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {/* Header */}
        <div>
          <h1 className="text-gray-900">Presensi</h1>
          <p className="text-gray-600 mt-1">Kelola presensi per kursus</p>
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
                <p className="text-sm text-gray-600 mb-1">Total Sesi</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((sum, c) => sum + c.totalSessions, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sesi Selesai</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((sum, c) => sum + c.completedSessions, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Mahasiswa</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((sum, c) => sum + c.totalStudents, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kursus, kode, dosen, atau asisten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Course Cards */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">Tidak ada kursus ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCourse(course);
                  setView('sessions');
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 font-semibold mb-1">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code} - {course.class}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Asisten: {course.assistant}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Sesi</p>
                      <p className="text-lg font-bold text-gray-900">{course.totalSessions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Sesi Selesai</p>
                      <p className="text-lg font-bold text-green-600">{course.completedSessions}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${(course.completedSessions / course.totalSessions) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.round((course.completedSessions / course.totalSessions) * 100)}% selesai
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View 2: List Sesi per Kursus
  if (view === 'sessions' && selectedCourse) {
    const courseSessions = sessions[selectedCourse.id] || [];
    const filteredSessions = courseSessions.filter(session => {
      const matchesSearch = session.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setView('courses');
            setSelectedCourse(null);
            setSearchQuery('');
            setFilterStatus('all');
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Daftar Kursus</span>
        </button>

        {/* Course Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">{selectedCourse.name}</h2>
          <p className="text-blue-100 mb-4">{selectedCourse.code} - {selectedCourse.class}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Dosen</p>
              <p className="font-semibold truncate">{selectedCourse.instructor}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Asisten</p>
              <p className="font-semibold truncate">{selectedCourse.assistant}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Total Mahasiswa</p>
              <p className="font-semibold">{selectedCourse.totalStudents} Orang</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Progress</p>
              <p className="font-semibold">{selectedCourse.completedSessions}/{selectedCourse.totalSessions} Sesi</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari topik sesi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="Berlangsung">Berlangsung</option>
                <option value="Selesai">Selesai</option>
                <option value="Dijadwalkan">Dijadwalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">Tidak ada sesi ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Sesi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Topik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{session.sessionNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {new Date(session.date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{session.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{session.topic}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-900">{session.present}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-gray-900">{session.excused}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-gray-900">{session.absent}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusBadge(session.status)}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setView('detail');
                          }}
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

  // View 3: Detail Presensi per Sesi
  if (view === 'detail' && selectedSession && selectedCourse) {
    const studentAttendances = studentAttendanceData[selectedSession.id] || [];

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setView('sessions');
            setSelectedSession(null);
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Daftar Sesi</span>
        </button>

        {/* Detail Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{selectedSession.sessionNumber}</span>
            </div>
            <span className="text-sm font-medium">Sesi {selectedSession.sessionNumber}</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{selectedSession.topic}</h2>
          <p className="text-blue-100 mb-4">{selectedCourse.name} - {selectedCourse.code}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Tanggal</p>
              <p className="font-semibold">
                {new Date(selectedSession.date).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Waktu</p>
              <p className="font-semibold">{selectedSession.time}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Total Mahasiswa</p>
              <p className="font-semibold">{selectedSession.totalStudents} Orang</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-sm text-blue-100 mb-1">Status</p>
              <p className="font-semibold">{selectedSession.status}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Asisten Lab Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedSession.assistantStatus === 'Hadir' ? 'bg-green-100' :
                selectedSession.assistantStatus === 'Izin' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Users className={`w-6 h-6 ${
                  selectedSession.assistantStatus === 'Hadir' ? 'text-green-600' :
                  selectedSession.assistantStatus === 'Izin' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Asisten Lab</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getAttendanceStatusBadge(selectedSession.assistantStatus)}`}>
                    {selectedSession.assistantStatus}
                  </span>
                  {selectedSession.assistantCheckInTime && (
                    <span className="text-xs text-gray-500">{selectedSession.assistantCheckInTime}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-gray-900">{selectedSession.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Izin</p>
                <p className="text-2xl font-bold text-gray-900">{selectedSession.excused}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tidak Hadir</p>
                <p className="text-2xl font-bold text-gray-900">{selectedSession.absent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Attendance List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg text-gray-900 font-semibold">Detail Presensi Mahasiswa</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAttendances.map((student, index) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getAttendanceIcon(student.status)}
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getAttendanceStatusBadge(student.status)}`}>
                          {student.status}
                        </span>
                      </div>
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

  return null;
}
