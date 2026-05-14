import { useEffect, useState } from 'react';
import { Beaker, Users, CheckSquare, Clock, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

export function AssistantDashboard() {
  const [dashboardData, setDashboardData] = useState({
    practicalSessions: [
    {
      id: 1,
      course: 'Pemrograman Dasar',
      class: 'TIF-A',
      lab: 'Lab 301',
      schedule: 'Senin, 14:00 - 16:00',
      students: 35,
      attendance: 32,
      topic: 'Praktikum Array dan Matrix',
    },
    {
      id: 2,
      course: 'Struktur Data',
      class: 'TIF-B',
      lab: 'Lab 302',
      schedule: 'Rabu, 14:00 - 16:00',
      students: 38,
      attendance: 35,
      topic: 'Implementasi Linked List',
    },
    {
      id: 3,
      course: 'Basis Data',
      class: 'TIF-C',
      lab: 'Lab 303',
      schedule: 'Jumat, 14:00 - 16:00',
      students: 32,
      attendance: 30,
      topic: 'Query SQL Lanjutan',
    },
    ],

    pendingTasks: [
    {
      id: 1,
      task: 'Verifikasi laporan praktikum Pemrograman Dasar',
      submitted: 28,
      total: 35,
      deadline: '2 hari lagi',
    },
    {
      id: 2,
      task: 'Input nilai praktikum Struktur Data',
      submitted: 35,
      total: 38,
      deadline: '3 hari lagi',
    },
    {
      id: 3,
      task: 'Persiapan modul praktikum Basis Data minggu depan',
      submitted: 0,
      total: 1,
      deadline: '5 hari lagi',
    },
    ],

    upcomingPracticals: [
    {
      id: 1,
      course: 'Pemrograman Dasar',
      class: 'TIF-A',
      time: 'Senin, 14:00 - 16:00',
      lab: 'Lab 301',
      topic: 'Praktikum Array dan Matrix',
    },
    {
      id: 2,
      course: 'Struktur Data',
      class: 'TIF-B',
      time: 'Rabu, 14:00 - 16:00',
      lab: 'Lab 302',
      topic: 'Implementasi Linked List',
    },
    ],

    recentActivities: [
    {
      id: 1,
      message: '8 mahasiswa mengumpulkan laporan praktikum',
      time: '1 jam lalu',
      type: 'submission',
    },
    {
      id: 2,
      message: 'Presensi Lab 301 telah dicatat (32/35 hadir)',
      time: '3 jam lalu',
      type: 'attendance',
    },
    {
      id: 3,
      message: 'Modul praktikum minggu depan telah diunggah',
      time: '1 hari lalu',
      type: 'module',
    },
    ],
  });

  useEffect(() => {
    api.get<typeof dashboardData>('/assistant/dashboard')
      .then(setDashboardData)
      .catch((error) => console.error('Failed to load assistant dashboard:', error));
  }, []);

  const { practicalSessions, pendingTasks, upcomingPracticals, recentActivities } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Dashboard Asisten Laboratorium</h1>
        <p className="text-gray-600 mt-1">Selamat datang, Andi Pratama - Asisten Lab Teknik Informatika</p>
      </div>

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
                        <p className="text-sm text-gray-600 mt-1">{session.topic}</p>
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
                      <p className="text-sm text-gray-700"><span className="font-medium">Topik:</span> {practical.topic}</p>
                    </div>
                  </div>
                ))}
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
