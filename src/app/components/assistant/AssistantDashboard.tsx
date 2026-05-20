import { useEffect, useState } from 'react';
import { Beaker, Users, CheckSquare, Clock, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

type AssistantDashboardProps = {
  userName?: string;
};

export function AssistantDashboard({ userName }: AssistantDashboardProps) {
  const [practicalSessions, setPracticalSessions] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [upcomingPracticals, setUpcomingPracticals] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any>('/assistant/dashboard');
        setPracticalSessions(data?.practicalSessions || []);
        setPendingTasks(data?.pendingTasks || []);
        setUpcomingPracticals(data?.upcomingPracticals || []);
        setRecentActivities(data?.recentActivities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat dashboard aslab');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Dashboard Asisten Laboratorium</h1>
        <p className="text-gray-600 mt-1">Selamat datang{userName ? `, ${userName}` : ''}</p>
      </div>
      {isLoading && <div className="text-sm text-gray-600">Memuat dashboard aslab...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sesi Praktikum</p>
              <p className="text-3xl font-bold text-gray-900">{practicalSessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Beaker className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Mahasiswa</p>
              <p className="text-3xl font-bold text-gray-900">
                {practicalSessions.reduce((sum, session) => sum + session.students, 0)}
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
              <p className="text-sm text-gray-600 mb-1">Tugas Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Praktikum Minggu Ini</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingPracticals.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practical Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Sesi Praktikum</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {practicalSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {session.class}
                          </span>
                          <span className="inline-flex px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            {session.lab}
                          </span>
                        </div>
                        <h3 className="text-gray-900 font-semibold">{session.course}</h3>
                        {session.topic && <p className="text-sm text-gray-600 mt-1">{session.topic}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Kehadiran</p>
                        <p className="text-lg font-bold text-green-600">{session.attendance}/{session.students}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.schedule}</span>
                    </div>
                  </div>
                ))}
                {!isLoading && !error && practicalSessions.length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                    Belum ada sesi praktikum.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Practicals */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Jadwal Praktikum Minggu Ini</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingPracticals.map((practical) => (
                  <div
                    key={practical.id}
                    className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Beaker className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 font-semibold">{practical.course}</h3>
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {practical.class}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{practical.time} • {practical.lab}</p>
                      {practical.topic && (
                        <p className="text-sm text-gray-700"><span className="font-medium">Topik:</span> {practical.topic}</p>
                      )}
                    </div>
                  </div>
                ))}
                {!isLoading && !error && upcomingPracticals.length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                    Belum ada jadwal praktikum minggu ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Tugas Pending</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {!isLoading && !error && pendingTasks.length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                    Belum ada tugas pending.
                  </div>
                )}
                {pendingTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900 font-medium">{task.task}</p>
                    </div>
                    <div className="ml-6 space-y-1">
                      {task.total > 1 && (
                        <p className="text-xs text-gray-600">
                          Progress: {task.submitted}/{task.total}
                        </p>
                      )}
                      <p className="text-xs text-yellow-700 font-medium">{task.deadline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Aktivitas Terkini</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {!isLoading && !error && recentActivities.length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                    Belum ada aktivitas terkini.
                  </div>
                )}
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      activity.type === 'submission' ? 'bg-blue-500' :
                      activity.type === 'attendance' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
