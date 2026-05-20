import { useEffect, useState } from 'react';
import { BookOpen, Search, Clock, GraduationCap, Users, ArrowLeft, Calendar, FileText, Upload, Plus, CheckCircle, XCircle, AlertCircle, Download, Trash2, X, Eye, Edit } from 'lucide-react';
import { getSubmissionDownloadUrl } from '../../../services/fileService';
import { api } from '../../../services/api';

interface Course {
  id: number;
  courseCode: string;
  name: string;
  lecturer: string;
  class: string;
  lab: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  semester: string;
  academicYear: string;
  students: number;
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  color: string;
}

interface Session {
  id: number;
  courseId: number;
  sessionNumber: number;
  title: string;
  date: string;
  time: string;
  description: string;
  room: string;
  reportStatus?: string;
  reportId?: number | null;
}

interface Material {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  submittedCount: number;
  totalStudents: number;
  sessionNumber: number;
}

interface AttendanceRecord {
  id: number;
  nim: string;
  name: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Izin' | '';
  time: string;
}

interface Submission {
  id: number;
  nim: string;
  name: string;
  submittedAt: string;
  fileName: string;
  fileSize: string;
  score: number | null;
  feedback: string;
  answerText: string;
}

export function AssistantPracticals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'sesi' | 'tugas'>('sesi');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showUploadMaterialModal, setShowUploadMaterialModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showAssistantAttendanceModal, setShowAssistantAttendanceModal] = useState(false);
  const [showStudentAttendanceModal, setShowStudentAttendanceModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [assistantAttendanceStatus, setAssistantAttendanceStatus] = useState<'Hadir' | 'Tidak Hadir' | ''>('Hadir');
  const [assistantAttendanceTime, setAssistantAttendanceTime] = useState('08:00');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [reportError, setReportError] = useState('');
  const [isSendingReport, setIsSendingReport] = useState(false);

  // Kursus yang diajar oleh asisten lab
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoadingCourses(true);
      setCoursesError('');
      try {
        const payload = await api.get<any>('/assistant/practicals');
        setCourses((payload?.courses || []).map((c: any) => ({
          id: c.id,
          courseCode: c.courseCode || c.classCode || c.code || '-',
          name: c.name,
          lecturer: c.lecturer || c.instructor || '-',
          class: c.class || c.classCode || '-',
          lab: c.lab || c.room || '-',
          schedule: {
            day: c.schedule?.day || c.day || '-',
            startTime: c.schedule?.startTime || c.startTime || '-',
            endTime: c.schedule?.endTime || c.endTime || '-',
          },
          semester: c.semester || '-',
          academicYear: c.academicYear || '-',
          students: c.students || 0,
          attendance: {
            present: c.attendance?.present || c.attendancePresent || 0,
            total: c.attendance?.total || c.attendanceTotal || 0,
            percentage: c.attendance?.percentage || (c.attendanceTotal > 0 ? Math.round((c.attendancePresent || 0) * 100 / c.attendanceTotal) : 0),
          },
          color: c.color || 'bg-blue-500',
        })));
        setSessions(payload?.sessions || []);
        setMaterials(payload?.materials || []);
        setAssignments(payload?.assignments || []);
        setSubmissions(payload?.submissions || []);
        setAttendanceRecords(payload?.attendanceRecords || []);
      } catch (err) {
        setCoursesError(err instanceof Error ? err.message : 'Gagal memuat kursus aslab');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    load();
  }, []);

  const academicYears = Array.from(new Set((courses || []).map((c) => c.academicYear).filter(Boolean)));
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = academicYear === 'all' || course.academicYear === academicYear;
    return matchesSearch && matchesYear;
  });

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('sesi');
    setSelectedSession(null);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setReportError('');
  };

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
    } else {
      setSelectedCourse(null);
    }
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
  };

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowGradingModal(true);
  };

  const handleUpdateAttendance = (recordId: number, status: 'Hadir' | 'Tidak Hadir' | 'Izin') => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status, time: status === 'Hadir' ? '08:00' : '-' }
          : record
      )
    );
  };

  const courseSessions = selectedCourse ? sessions.filter((session) => session.courseId === selectedCourse.id) : [];
  const courseMaterials = selectedCourse ? materials.filter((material: any) => !material.courseId || material.courseId === selectedCourse.id) : materials;
  const courseAssignments = selectedCourse ? assignments.filter((assignment: any) => !assignment.courseId || assignment.courseId === selectedCourse.id) : assignments;

  const handleSendSessionReport = async () => {
    if (!selectedSession) return;
    setIsSendingReport(true);
    setReportError('');
    try {
      const result = await api.post<any>(`/assistant/sessions/${selectedSession.id}/reports`, {});
      setSessions((items) =>
        items.map((item) =>
          item.id === selectedSession.id
            ? { ...item, reportStatus: result?.status || 'Menunggu Review', reportId: result?.id || item.reportId }
            : item
        )
      );
      setSelectedSession((session) =>
        session ? { ...session, reportStatus: result?.status || 'Menunggu Review', reportId: result?.id || session.reportId } : session
      );
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Gagal kirim laporan');
    } finally {
      setIsSendingReport(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Hadir': 'bg-green-100 text-green-700',
      'Tidak Hadir': 'bg-red-100 text-red-700',
      'Izin': 'bg-yellow-100 text-yellow-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Hadir') return <CheckCircle className="w-4 h-4" />;
    if (status === 'Tidak Hadir') return <XCircle className="w-4 h-4" />;
    if (status === 'Izin') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  // Jika ada sesi yang dipilih, tampilkan detail sesi
  if (selectedSession && selectedCourse) {
    const presentCount = attendanceRecords.filter(r => r.status === 'Hadir').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'Tidak Hadir').length;
    const excusedCount = attendanceRecords.filter(r => r.status === 'Izin').length;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Daftar Sesi</span>
        </button>

        {/* Informasi */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-6">Sesi {selectedSession.sessionNumber}</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Topik Materi</p>
              <p className="text-gray-900 font-medium">{selectedSession.title}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Tanggal dan Waktu</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{selectedSession.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-900">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{selectedSession.time}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Tipe Sesi</p>
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="font-medium">Offline</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-gray-900 font-semibold">Laporan Sesi</h3>
              <p className="text-sm text-gray-600 mt-1">
                Status: {selectedSession.reportStatus || 'Belum dikirim'}
              </p>
              {reportError && <p className="text-sm text-red-600 mt-2">{reportError}</p>}
            </div>
            <button
              onClick={handleSendSessionReport}
              disabled={isSendingReport || selectedSession.reportStatus === 'Menunggu Review' || selectedSession.reportStatus === 'Disetujui'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm font-medium"
            >
              {isSendingReport ? 'Mengirim...' : selectedSession.reportStatus === 'Ditolak' ? 'Kirim Ulang' : 'Kirim Laporan'}
            </button>
          </div>
        </div>

        {/* Upload Materi */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">Materi Praktikum</h3>
            <button 
              onClick={() => setShowUploadMaterialModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Materi
            </button>
          </div>
          {courseMaterials.length > 0 ? (
            <div className="space-y-2">
              {courseMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{material.name}</p>
                      <p className="text-xs text-gray-500">{material.type} • {material.size} • {material.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Belum ada materi yang diupload</p>
            </div>
          )}
        </div>

        {/* Berikan Tugas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">Tugas untuk Sesi Ini</h3>
            <button 
              onClick={() => setShowAddAssignmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Buat Tugas Baru
            </button>
          </div>
          {courseAssignments.filter(a => a.sessionNumber === selectedSession.sessionNumber).length > 0 ? (
            <div className="space-y-3">
              {courseAssignments.filter(a => a.sessionNumber === selectedSession.sessionNumber).map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-gray-900 font-medium">{assignment.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      assignment.submittedCount === assignment.totalStudents
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {assignment.submittedCount}/{assignment.totalStudents} Submit
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {assignment.deadline}</span>
                    </div>
                    <button
                      onClick={() => handleViewSubmissions(assignment)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Lihat Submission
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Belum ada tugas untuk sesi ini</p>
            </div>
          )}
        </div>

        {/* Presensi */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold">Presensi</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAssistantAttendanceModal(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
              >
                Absen Asisten Lab
              </button>
              <button 
                onClick={() => setShowStudentAttendanceModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Absen Mahasiswa
              </button>
            </div>
          </div>
          
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-700 font-medium">Hadir</p>
              </div>
              <p className="text-2xl font-bold text-green-900">{presentCount}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700 font-medium">Tidak Hadir</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{absentCount}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-700 font-medium">Izin</p>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{excusedCount}</p>
            </div>
          </div>

          {/* Attendance List */}
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
                {attendanceRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.nim}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{record.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assistant Attendance */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-gray-900 font-semibold mb-3">Presensi Asisten Lab</h4>
            <div className={`flex items-center justify-between p-4 border rounded-lg ${
              assistantAttendanceStatus === 'Hadir' 
                ? 'bg-green-50 border-green-200' 
                : assistantAttendanceStatus === 'Tidak Hadir'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  assistantAttendanceStatus === 'Hadir' ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  AP
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Andi Prasetyo, S.Kom</p>
                  <p className="text-sm text-gray-600">Asisten Laboratorium</p>
                </div>
              </div>
              <div className="text-right">
                {assistantAttendanceStatus ? (
                  <>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(assistantAttendanceStatus)}`}>
                      {getStatusIcon(assistantAttendanceStatus)}
                      {assistantAttendanceStatus}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{assistantAttendanceTime}</p>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Belum absen</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Material Modal */}
        {showUploadMaterialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold">Upload Materi Praktikum</h3>
                <button
                  onClick={() => setShowUploadMaterialModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Materi</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan judul materi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Materi</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-blue-600 font-medium">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, ZIP, PPTX, DOCX (Max. 50MB)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi (Opsional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Tambahkan deskripsi materi..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadMaterialModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Upload Materi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assistant Attendance Modal */}
        {showAssistantAttendanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold">Presensi Asisten Lab</h3>
                <button
                  onClick={() => setShowAssistantAttendanceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    AP
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Andi Prasetyo, S.Kom</p>
                    <p className="text-sm text-gray-600">Asisten Laboratorium</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Kehadiran</label>
                  <select
                    value={assistantAttendanceStatus}
                    onChange={(e) => setAssistantAttendanceStatus(e.target.value as 'Hadir' | 'Tidak Hadir')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Pilih status...</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                </div>
                {assistantAttendanceStatus === 'Hadir' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Waktu Kehadiran</label>
                    <input
                      type="time"
                      value={assistantAttendanceTime}
                      onChange={(e) => setAssistantAttendanceTime(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowAssistantAttendanceModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => setShowAssistantAttendanceModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Simpan Presensi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Attendance Modal */}
        {showStudentAttendanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-gray-900 font-semibold">Presensi Mahasiswa - Sesi {selectedSession.sessionNumber}</h3>
                <button
                  onClick={() => setShowStudentAttendanceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
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
                      {attendanceRecords.map((record, index) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.nim}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{record.name}</td>
                          <td className="px-4 py-3 text-center">
                            <select
                              value={record.status}
                              onChange={(e) => handleUpdateAttendance(record.id, e.target.value as 'Hadir' | 'Tidak Hadir' | 'Izin')}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                            >
                              <option value="">Pilih...</option>
                              <option value="Hadir">Hadir</option>
                              <option value="Tidak Hadir">Tidak Hadir</option>
                              <option value="Izin">Izin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {record.status === 'Hadir' ? (
                              <input
                                type="time"
                                defaultValue="08:00"
                                className="px-2 py-1 rounded border border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Hadir: <span className="font-semibold text-green-600">{presentCount}</span> • 
                  Tidak Hadir: <span className="font-semibold text-red-600">{absentCount}</span> • 
                  Izin: <span className="font-semibold text-yellow-600">{excusedCount}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowStudentAttendanceModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => setShowStudentAttendanceModal(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Simpan Presensi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Assignment Modal */}
        {showAddAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-gray-900 font-semibold">Buat Tugas Baru</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan judul tugas..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan deskripsi tugas..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Simpan Tugas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Jika ada kursus yang dipilih, tampilkan halaman course detail dengan tabs
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Daftar Kursus</span>
        </button>

        {/* Course Header */}
        <div className="bg-blue-500 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white mb-2">{selectedCourse.name}</h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <GraduationCap className="w-4 h-4" />
                    <span>{selectedCourse.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <Clock className="w-4 h-4" />
                    <span>{selectedCourse.schedule.day} & Kamis, {selectedCourse.schedule.startTime} - {selectedCourse.schedule.endTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-1">
                <Users className="w-4 h-4" />
                <span>Andi Prasetyo, S.Kom</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <Calendar className="w-4 h-4" />
                <span>Kehadiran: {selectedCourse.attendance.present}/{selectedCourse.attendance.total} ({selectedCourse.attendance.percentage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('sesi')}
                className={`flex-1 px-6 py-4 text-center transition-colors ${
                  activeTab === 'sesi'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sesi Kursus
              </button>
              <button
                onClick={() => setActiveTab('tugas')}
                className={`flex-1 px-6 py-4 text-center transition-colors ${
                  activeTab === 'tugas'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tugas
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'sesi' && (
              <div>
                <h3 className="text-gray-900 font-semibold mb-4">Daftar Sesi Kursus</h3>
                <div className="space-y-3">
                  {courseSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h4 className="text-gray-900 font-medium mb-1">
                          Sesi {session.sessionNumber}
                        </h4>
                        <p className="text-gray-700 mb-2">{session.title}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSessionClick(session)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tugas' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-semibold">Semua Tugas yang Diberikan</h3>
                  <button 
                    onClick={() => setShowAddAssignmentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Tugas
                  </button>
                </div>
                
                {courseAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {courseAssignments.map((assignment) => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Sesi {assignment.sessionNumber}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                assignment.submittedCount === assignment.totalStudents
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {assignment.submittedCount}/{assignment.totalStudents} Submit
                              </span>
                            </div>
                            <h4 className="text-gray-900 font-semibold mb-1">{assignment.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>Deadline: {assignment.deadline}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${(assignment.submittedCount / assignment.totalStudents) * 100}%` }}
                            />
                          </div>
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium whitespace-nowrap"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-gray-900 font-semibold mb-2">Belum Ada Tugas</h3>
                    <p className="text-gray-600">Klik "Buat Tugas" untuk membuat tugas baru</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Assignment Modal */}
        {showAddAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-gray-900 font-semibold">Buat Tugas Baru</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Sesi</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none">
                    <option value="">Pilih sesi...</option>
                    {sessions.map(session => (
                      <option key={session.id} value={session.id}>
                        Sesi {session.sessionNumber} - {session.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan judul tugas..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                    placeholder="Masukkan deskripsi tugas..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Simpan Tugas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Halaman daftar kursus (default view)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-1">Kursus yang Diampu</h2>
        <p className="text-gray-500">Kelola dan pantau progres kursus praktikum yang Anda ajar</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
              placeholder="Cari kursus..."
            />
          </div>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="all">Semua Tahun Akademik</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>Tahun Akademik {year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoadingCourses && <div className="text-sm text-gray-600">Memuat kursus...</div>}
      {coursesError && <div className="text-sm text-red-600">{coursesError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => handleCourseClick(course)}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className={`${course.color} h-24 relative`}>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-gray-900 mb-4">{course.name}</h3>
              
              <div className="space-y-3 mb-4">
                {/* Dosen */}
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Dosen</p>
                    <p className="text-sm text-gray-900 truncate">{course.lecturer}</p>
                  </div>
                </div>
                
                {/* Waktu */}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Waktu</p>
                    <p className="text-sm text-gray-900">
                      {course.schedule.day}, {course.schedule.startTime} - {course.schedule.endTime}
                    </p>
                  </div>
                </div>

                {/* Mahasiswa */}
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Mahasiswa</p>
                    <p className="text-sm text-gray-900">{course.students} Mahasiswa</p>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-600">Kehadiran Sesi</span>
                  <span className="text-gray-900">
                    {course.attendance.present}/{course.attendance.total} sesi ({course.attendance.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${course.color} h-2 rounded-full transition-all`}
                    style={{ width: `${course.attendance.percentage}%` }}
                  />
                </div>
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
          <p className="text-gray-600 mb-4">Coba ubah kata kunci pencarian Anda</p>
        </div>
      )}

      {/* Submissions Modal - Global */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-semibold">Submission Tugas</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowSubmissionsModal(false);
                  setSelectedAssignment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold">
                          {submission.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-gray-900 font-medium">{submission.name}</p>
                            <p className="text-sm text-gray-600">{submission.nim}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={getSubmissionDownloadUrl(submission.id)}
                              download
                              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Download Tugas
                            </a>
                            <button
                              onClick={() => handleGradeSubmission(submission)}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              {submission.score !== null ? 'Edit Nilai' : 'Beri Nilai'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{submission.fileName} ({submission.fileSize})</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Submit: {submission.submittedAt}</span>
                          </div>
                        </div>

                        {submission.answerText && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <p className="text-sm text-gray-700 leading-relaxed">{submission.answerText}</p>
                          </div>
                        )}

                        {submission.score !== null && (
                          <div className="flex items-start gap-2">
                            <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                              Nilai: {submission.score}
                            </span>
                            {submission.feedback && (
                              <span className="text-sm text-gray-600">• {submission.feedback}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal - Global */}
      {showGradingModal && selectedSubmission && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-semibold">Penilaian Tugas</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedSubmission.name} - {selectedSubmission.nim}</p>
              </div>
              <button
                onClick={() => {
                  setShowGradingModal(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>{selectedSubmission.fileName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Submit: {selectedSubmission.submittedAt}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nilai (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedSubmission.score || ''}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="Masukkan nilai..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                <textarea
                  rows={4}
                  defaultValue={selectedSubmission.feedback}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="Berikan feedback untuk mahasiswa..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowGradingModal(false);
                  setSelectedSubmission(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Simpan Nilai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
