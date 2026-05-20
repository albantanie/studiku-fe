import { useEffect, useState } from 'react';
import { UserCheck, Search, Filter, Calendar, CheckCircle, XCircle, Download, Eye, X } from 'lucide-react';
import { api } from '../../../services/api';

interface Student {
  id: number;
  nim: string;
  name: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  time?: string;
}

interface AttendanceSession {
  id: number;
  courseCode: string;
  courseName: string;
  class: string;
  date: string;
  time: string;
  lab: string;
  topic: string;
  totalStudents: number;
  present: number;
  absent: number;
  sick: number;
  permit: number;
}

export function AssistantAttendance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<Student[]>([]);
  const [studentAttendanceBySession, setStudentAttendanceBySession] = useState<Record<number, Student[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const payload = await api.get<any>('/assistant/attendance');
        setAttendanceSessions(payload?.attendanceSessions || []);
        setStudentAttendanceBySession(payload?.studentAttendanceBySession || {});
        setStudentAttendance(payload?.studentAttendance || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data presensi');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredSessions = attendanceSessions.filter(session => {
    const matchesSearch = 
      session.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || session.courseCode === filterCourse;
    const matchesDate = !filterDate || session.date === filterDate;
    
    return matchesSearch && matchesCourse && matchesDate;
  });

  const handleViewDetail = (session: AttendanceSession) => {
    setSelectedSession(session);
    setStudentAttendance(studentAttendanceBySession[session.id] || []);
    setShowDetailModal(true);
  };

  const handleUpdateRecord = (id: number, patch: Partial<Student>) => {
    setStudentAttendance((records) =>
      records.map((record) => (record.id === id ? { ...record, ...patch } : record))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;
    setIsSaving(true);
    setError('');
    try {
      await api.put(`/assistant/attendance/sessions/${selectedSession.id}`, {
        records: studentAttendance.map((record) => ({
          id: record.id,
          nim: record.nim,
          name: record.name,
          status: record.status,
          time: record.time || '',
        })),
      });
      const payload = await api.get<any>('/assistant/attendance');
      setAttendanceSessions(payload?.attendanceSessions || []);
      setStudentAttendanceBySession(payload?.studentAttendanceBySession || {});
      setStudentAttendance(payload?.studentAttendanceBySession?.[selectedSession.id] || []);
      setShowDetailModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan presensi');
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendancePercentage = (session: AttendanceSession) => {
    if (!session.totalStudents) return '0.0';
    return ((session.present / session.totalStudents) * 100).toFixed(1);
  };

  const totalStudents = attendanceSessions.reduce((sum, s) => sum + s.totalStudents, 0);
  const attendanceAverage = totalStudents
    ? ((attendanceSessions.reduce((sum, s) => sum + s.present, 0) / totalStudents) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Presensi Praktikum</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau kehadiran praktikum mahasiswa</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sesi</p>
              <p className="text-3xl font-bold text-gray-900">{attendanceSessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rata-rata Hadir</p>
              <p className="text-3xl font-bold text-green-600">
                {attendanceAverage}%
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
                {attendanceSessions.reduce((sum, s) => sum + s.totalStudents, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tidak Hadir</p>
              <p className="text-3xl font-bold text-red-600">
                {attendanceSessions.reduce((sum, s) => sum + s.absent, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari kursus atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Course */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
                <option value="all">Semua Kursus</option>
                {Array.from(new Set(attendanceSessions.map((s) => s.courseCode))).map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

          {/* Filter Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {isLoading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat data presensi...</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

      {/* Attendance Sessions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-gray-900">Riwayat Presensi Praktikum</h2>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Praktikum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Waktu & Lab
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Hadir
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Izin
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Sakit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Alpa
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Persentase
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.courseName}</p>
                      <p className="text-xs text-gray-500">{session.courseCode} - {session.class}</p>
                      <p className="text-xs text-gray-500 mt-1">{session.topic}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(session.date).toLocaleDateString('id-ID', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.time}</div>
                    <div className="text-xs text-gray-500">{session.lab}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {session.present}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {session.permit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                      {session.sick}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                      {session.absent}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-green-600">
                      {getAttendancePercentage(session)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetail(session)}
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
      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">Tidak ada data presensi</h3>
          <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedSession.courseCode}
                    </span>
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedSession.class}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedSession.courseName}</h2>
                  <p className="text-blue-100 mt-1">{selectedSession.topic}</p>
                  <p className="text-sm text-blue-100 mt-2">
                    {new Date(selectedSession.date).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} • {selectedSession.time} • {selectedSession.lab}
                  </p>
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
            <div className="p-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedSession.present}</p>
                  <p className="text-xs text-gray-600 mt-1">Hadir</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedSession.permit}</p>
                  <p className="text-xs text-gray-600 mt-1">Izin</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{selectedSession.sick}</p>
                  <p className="text-xs text-gray-600 mt-1">Sakit</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedSession.absent}</p>
                  <p className="text-xs text-gray-600 mt-1">Alpa</p>
                </div>
              </div>

              {/* Student List */}
              <h3 className="text-gray-900 font-semibold mb-4">Daftar Mahasiswa</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">NIM</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Nama</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentAttendance.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.nim}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={student.status}
                            onChange={(e) => handleUpdateRecord(student.id, { status: e.target.value as Student['status'] })}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Izin">Izin</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Alpa">Alpa</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                          {student.status === 'Hadir' ? (
                            <input
                              type="time"
                              value={student.time || '08:00'}
                              onChange={(e) => handleUpdateRecord(student.id, { time: e.target.value })}
                              className="px-2 py-1 rounded border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                            />
                          ) : (
                            '-'
                          )}
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
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Presensi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
