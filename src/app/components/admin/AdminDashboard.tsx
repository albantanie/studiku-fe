import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, TrendingUp, UserCheck, Clock, Award } from 'lucide-react';
import { api } from '../../../services/api';

export function AdminDashboard() {
  const iconMap = { user: UserCheck, file: FileText, book: BookOpen, award: Award };
  const [dashboardData, setDashboardData] = useState({
    stats: [
    { label: 'Total Mahasiswa', value: '1,234', icon: Users, color: 'blue', change: '+12%' },
    { label: 'Total Kursus', value: '48', icon: BookOpen, color: 'purple', change: '+5%' },
    { label: 'Tugas Aktif', value: '156', icon: FileText, color: 'green', change: '+8%' },
    { label: 'Tingkat Kelulusan', value: '87%', icon: Award, color: 'orange', change: '+3%' },
    ],

    recentActivities: [
    { action: 'Mahasiswa baru terdaftar', detail: 'Ahmad Fauzi - Teknik Informatika', time: '5 menit lalu', icon: UserCheck },
    { action: 'Tugas baru dibuat', detail: 'Tugas Algoritma & Pemrograman', time: '15 menit lalu', icon: FileText },
    { action: 'Kursus diperbarui', detail: 'Database Management - Materi Week 5', time: '1 jam lalu', icon: BookOpen },
    { action: 'Nilai diinput', detail: 'UTS Pemrograman Web - 45 mahasiswa', time: '2 jam lalu', icon: Award },
    ],

    topCourses: [
    { name: 'Pemrograman Web', students: 156, completion: 78, instructor: 'Dr. Budi Santoso' },
    { name: 'Database Management', students: 142, completion: 82, instructor: 'Prof. Siti Aminah' },
    { name: 'Algoritma & Pemrograman', students: 138, completion: 71, instructor: 'Dr. Ahmad Wijaya' },
    { name: 'Machine Learning', students: 124, completion: 65, instructor: 'Dr. Rina Kusuma' },
    ],
  });

  useEffect(() => {
    api.get<any>('/admin/dashboard')
      .then((data) => {
        setDashboardData({
          stats: data.stats.map((stat: any, index: number) => ({
            ...stat,
            icon: [Users, BookOpen, FileText, Award][index] || Users,
          })),
          recentActivities: data.recentActivities.map((activity: any) => ({
            ...activity,
            icon: iconMap[activity.icon as keyof typeof iconMap] || UserCheck,
          })),
          topCourses: data.topCourses,
        });
      })
      .catch((error) => console.error('Failed to load admin dashboard:', error));
  }, []);

  const { stats, recentActivities, topCourses } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Selamat datang di panel administrator StudiKu</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-xs text-gray-500">vs bulan lalu</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="mb-4">
            <h3 className="text-gray-900">Aktivitas Terbaru</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{activity.detail}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="mb-4">
            <h3 className="text-gray-900">Kursus Terpopuler</h3>
          </div>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-900">{course.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{course.instructor}</p>
                  </div>
                  <span className="text-sm text-gray-600">{course.students} siswa</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${course.completion}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Tingkat penyelesaian: {course.completion}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
