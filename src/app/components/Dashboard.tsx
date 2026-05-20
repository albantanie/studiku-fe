import { useEffect, useState } from 'react';
import { BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onCourseSelect: (courseId: number) => void;
}

export function Dashboard({ setActiveTab, onCourseSelect }: DashboardProps) {
  const [todayCourses, setTodayCourses] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any>('/student/dashboard');
        setTodayCourses(data?.todayCourses || []);
        setUpcomingDeadlines(data?.upcomingDeadlines || []);
        setPendingTaskCount(data?.pendingTaskCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-white mb-2">Selamat Datang Kembali! 👋</h2>
        <p className="text-blue-100">
          {pendingTaskCount > 0
            ? `Anda memiliki ${pendingTaskCount} tugas aktif yang perlu diselesaikan.`
            : 'Belum ada tugas aktif yang perlu diselesaikan.'}
        </p>
      </div>
      {isLoading && <div className="text-sm text-gray-600">Memuat dashboard...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today Courses */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-6">Kursus Hari Ini</h3>
          <div className="space-y-4">
            {todayCourses.length === 0 && !isLoading && !error && (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                Belum ada kursus hari ini.
              </div>
            )}
            {todayCourses.map((course) => (
              <div key={course.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer" onClick={() => onCourseSelect(course.id)}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${course.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 mb-1">{course.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.time}</span>
                      </div>
                      <span>• {course.room}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-6">Deadline Mendatang</h3>
          <div className="space-y-4">
            {upcomingDeadlines.length === 0 && !isLoading && !error && (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                Belum ada deadline tugas.
              </div>
            )}
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  {deadline.urgent ? (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-gray-900 mb-1">{deadline.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{deadline.course}</p>
                    <p className={`text-xs ${deadline.urgent ? 'text-red-600' : 'text-gray-600'}`}>
                      {deadline.dueDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Link to see all assignments */}
          <button
            onClick={() => setActiveTab('assignments')}
            className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Lihat tugas lainnya →
          </button>
        </div>
      </div>
    </div>
  );
}
