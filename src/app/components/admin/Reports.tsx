import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Calendar } from 'lucide-react';
import { api } from '../../../services/api';

export function Reports() {
  const [reportData, setReportData] = useState({
    stats: [
    { label: 'Total Mahasiswa Aktif', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Rata-rata IPK', value: '3.45', change: '+0.15', trend: 'up' },
    { label: 'Tingkat Kelulusan', value: '87%', change: '+3%', trend: 'up' },
    { label: 'Mahasiswa Baru', value: '245', change: '+8%', trend: 'up' },
    ],

    coursePerformance: [
    { course: 'Pemrograman Web', students: 156, avgScore: 82, completion: 78, passing: 89 },
    { course: 'Database Management', students: 142, avgScore: 85, completion: 82, passing: 92 },
    { course: 'Algoritma & Pemrograman', students: 138, avgScore: 78, completion: 71, passing: 84 },
    { course: 'Machine Learning', students: 124, avgScore: 80, completion: 65, passing: 87 },
    { course: 'Desain UI/UX', students: 98, avgScore: 88, completion: 90, passing: 95 },
    ],

    topStudents: [
    { name: 'Siti Nurhaliza', program: 'Sistem Informasi', gpa: 3.92, completedCourses: 24 },
    { name: 'Rizky Prasetyo', program: 'Sistem Informasi', gpa: 3.81, completedCourses: 22 },
    { name: 'Ahmad Fauzi', program: 'Teknik Informatika', gpa: 3.75, completedCourses: 20 },
    { name: 'Dewi Lestari', program: 'Desain Komunikasi Visual', gpa: 3.68, completedCourses: 18 },
    { name: 'Budi Santoso', program: 'Teknik Informatika', gpa: 3.45, completedCourses: 25 },
    ],

    monthlyRegistrations: [
    { month: 'Sep 2024', students: 198 },
    { month: 'Oct 2024', students: 156 },
    { month: 'Nov 2024', students: 142 },
    { month: 'Dec 2024', students: 178 },
    { month: 'Jan 2025', students: 245 },
    ],
  });

  useEffect(() => {
    api.get<typeof reportData>('/admin/reports')
      .then(setReportData)
      .catch((error) => console.error('Failed to load reports:', error));
  }, []);

  const { stats, coursePerformance, topStudents, monthlyRegistrations } = reportData;

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 mt-1">Analisis performa akademik dan statistik sistem</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-gray-900 mb-2">{stat.value}</p>
            <div className="flex items-center gap-1">
              <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500">vs bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Performa Kursus</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {coursePerformance.map((course, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-900">{course.course}</p>
                    <p className="text-xs text-gray-600">{course.students} mahasiswa</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">Nilai: {course.avgScore}</p>
                    <p className="text-xs text-gray-600">Lulus: {course.passing}%</p>
                  </div>
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

        {/* Top Students */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Mahasiswa Berprestasi</h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div key={index} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-600">{student.program}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">IPK: {student.gpa}</p>
                  <p className="text-xs text-gray-600">{student.completedCourses} kursus</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Registrations Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900">Pendaftaran Bulanan</h3>
            <p className="text-sm text-gray-600 mt-1">Tren pendaftaran mahasiswa baru</p>
          </div>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {monthlyRegistrations.map((data, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-600">{data.month}</div>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${(data.students / 300) * 100}%` }}
                  >
                    <span className="text-white text-sm">{data.students}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <Users className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-80 mb-1">Total Mahasiswa Terdaftar</p>
          <p className="text-4xl mb-2">1,234</p>
          <p className="text-sm opacity-80">Aktif di 48 kursus</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <BookOpen className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-80 mb-1">Total Kursus Aktif</p>
          <p className="text-4xl mb-2">48</p>
          <p className="text-sm opacity-80">Dengan 156 tugas aktif</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <Award className="w-10 h-10 mb-3 opacity-80" />
          <p className="text-sm opacity-80 mb-1">Lulusan Tahun Ini</p>
          <p className="text-4xl mb-2">892</p>
          <p className="text-sm opacity-80">Tingkat kelulusan 87%</p>
        </div>
      </div>
    </div>
  );
}
