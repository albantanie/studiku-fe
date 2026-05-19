import { useState, useEffect } from 'react';
import { BookOpen, Clock, Search, Calendar, User, GraduationCap } from 'lucide-react';
import { CourseDetail } from './CourseDetail';
import { api } from '../../services/api';

interface CoursesProps {
  selectedCourseId?: number | null;
  onClearSelection: () => void;
}

export function Courses({ selectedCourseId, onClearSelection }: CoursesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [academicYear, setAcademicYear] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await api.get<any[]>('/student/courses');
        setEnrolledCourses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat kursus');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Auto-select course if selectedCourseId is provided
  useEffect(() => {
    if (selectedCourseId) {
      const course = enrolledCourses.find(c => c.id === selectedCourseId);
      if (course) {
        setSelectedCourse(course);
        onClearSelection();
      }
    }
  }, [selectedCourseId]);

  const academicYears = Array.from(new Set((enrolledCourses || []).map((c) => c.academicYear).filter(Boolean)));
  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tutor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = academicYear === 'all' || course.academicYear === academicYear;
    return matchesSearch && matchesYear;
  });

  // Jika ada kursus yang dipilih, tampilkan detail
  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-gray-900 mb-1">Kelas yang Diikuti</h2>
          <p className="text-gray-500">Kelola dan pantau progres kursus Anda</p>
        </div>
        
        {/* Search and Filter */}
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
      {isLoading && <div className="text-sm text-gray-600">Memuat kursus...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {!isLoading && !error && filteredCourses.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Belum ada kursus yang diikuti.
          </div>
        )}
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCourse(course)}
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
                
                {/* Tutor */}
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Tutor</p>
                    <p className="text-sm text-gray-900 truncate">{course.tutor}</p>
                  </div>
                </div>
                
                {/* Jadwal */}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Jadwal</p>
                    <p className="text-sm text-gray-900">
                      {course.schedule.day}, {course.schedule.startTime} - {course.schedule.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-600">Kehadiran</span>
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
    </div>
  );
}
