import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, TrendingUp, UserCheck, Clock, Award } from 'lucide-react';
import { api } from '../../../services/api';

export function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any>('/admin/dashboard');
        setStats(data?.stats || []);
        setRecentActivities(data?.recentActivities || []);
        setTopCourses(data?.topCourses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat dashboard admin');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Selamat datang di panel administrator StudiKu</p>
        </div>
      </div>
      {isLoading && <div className="text-sm text-gray-600">Memuat dashboard admin...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!isLoading && !error && stats.length === 0 && (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          Data masih kosong. Jalankan seed data atau tambah data dari menu admin.
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-gray-900 mb-2">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                    <span className="text-xs text-gray-500">vs bulan lalu</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Aktivitas Terbaru</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 && !isLoading && !error && (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                Belum ada aktivitas terbaru.
              </div>
            )}
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.action || '-'}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{activity.detail || '-'}</p>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Kursus Terpopuler</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {topCourses.length === 0 && !isLoading && !error && (
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                Belum ada data kursus.
              </div>
            )}
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
