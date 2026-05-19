import { useEffect, useState } from 'react';
import { BookOpen, Users, Award, Calendar, TrendingUp, Clock } from 'lucide-react';
import { api } from '../../../services/api';

export function LecturerDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any>('/lecturer/dashboard');
        setCourses(data?.courses || []);
        setUpcomingClasses(data?.upcomingClasses || []);
        setRecentActivities(data?.recentActivities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat dashboard dosen');
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
        <h1 className="text-gray-900">Dashboard Dosen</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali, Prof. Dr. Ahmad Wijaya</p>
      </div>
      {isLoading && <div className="text-sm text-gray-600">Memuat dashboard dosen...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

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

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rata-rata Nilai</p>
              <p className="text-3xl font-bold text-gray-900">
                {courses.length > 0 ? (courses.reduce((sum, course) => sum + course.averageGrade, 0) / courses.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kelas Minggu Ini</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingClasses.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Kursus</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {course.code}
                          </span>
                          <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {course.class}
                          </span>
                        </div>
                        <h3 className="text-gray-900 font-semibold">{course.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{course.averageGrade}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Mahasiswa</p>
                        <p className="text-gray-900 font-medium">{course.students} orang</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Jadwal</p>
                        <p className="text-gray-900 font-medium">{course.schedule}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Ruangan</p>
                        <p className="text-gray-900 font-medium">{course.room}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!isLoading && !error && courses.length === 0 && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                    Belum ada kursus untuk dosen.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-gray-900">Jadwal Kelas Minggu Ini</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 font-semibold">{classItem.course}</h3>
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {classItem.class}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{classItem.time} • {classItem.room}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Topik:</span> {classItem.topic}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                    activity.type === 'assignment' ? 'bg-blue-500' :
                    activity.type === 'grade' ? 'bg-green-500' :
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
  );
}
