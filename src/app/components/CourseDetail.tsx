import { ArrowLeft, BookOpen, Clock, User, GraduationCap, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SessionDetail } from './SessionDetail';
import { api } from '../../services/api';

interface CourseDetailProps {
  course: {
    id: number;
    name: string;
    lecturer: string;
    tutor: string;
    schedule: {
      day: string;
      startTime: string;
      endTime: string;
    };
    attendance: {
      present: number;
      total: number;
      percentage: number;
    };
    color: string;
  };
  onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'assignments'>('sessions');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [courseSessions, setCourseSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>(`/student/courses/${course.id}/detail`).then((data) => {
      setMaterials(data?.materials || []);
      setCourseSessions(data?.courseSessions || []);
      setAssignments(data?.assignments || []);
    }).catch(() => {
      setMaterials([]);
      setCourseSessions([]);
      setAssignments([]);
    });
  }, [course.id]);

  // Jika ada sesi yang dipilih, tampilkan detail
  if (selectedSession) {
    return <SessionDetail session={selectedSession} onBack={() => setSelectedSession(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali ke Daftar Kursus</span>
      </button>

      {/* Course Header */}
      <div className={`${course.color} rounded-2xl p-6 text-white`}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-white mb-2">{course.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>{course.lecturer}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{course.tutor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.schedule.day}, {course.schedule.startTime} - {course.schedule.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Kehadiran: {course.attendance.present}/{course.attendance.total} ({course.attendance.percentage}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'sessions'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sesi Kursus
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'assignments'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tugas
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Sesi Kursus */}
          {activeTab === 'sessions' && (
            <div>
              <h3 className="text-gray-900 mb-4">Daftar Sesi Kursus</h3>
              <div className="space-y-3">
                {courseSessions.map((session) => (
                  <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm text-gray-900 mb-1">{session.sessionName}</h4>
                        <p className="text-sm text-gray-700 mb-2">{session.topic}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Tugas */}
          {activeTab === 'assignments' && (
            <div>
              <h3 className="text-gray-900 mb-4">Daftar Tugas</h3>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm text-gray-900 mb-1">{assignment.title}</h4>
                        <p className="text-xs text-gray-500">Deadline: {assignment.dueDate}</p>
                      </div>
                      {assignment.score !== null && (
                        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          Nilai: {assignment.score}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-block text-xs px-3 py-1 rounded-full ${
                        assignment.status === 'submitted'
                          ? 'bg-green-100 text-green-700'
                          : assignment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {assignment.status === 'submitted'
                        ? 'Sudah Dikumpulkan'
                        : assignment.status === 'pending'
                        ? 'Belum Dikumpulkan'
                        : 'Akan Datang'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
