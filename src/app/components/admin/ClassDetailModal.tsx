import { X, Users, BookOpen, Calendar, Mail, User, Download, Search } from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: number;
  name: string;
  nim: string;
  email: string;
}

interface ClassData {
  name: string;
  code: string;
  academicYear: string;
  semester: string;
  capacity: number;
  students: Student[];
  courses: string[];
}

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassData | null;
}

export function ClassDetailModal({ isOpen, onClose, classData }: ClassDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !classData) return null;

  const filteredStudents = classData.students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const occupancyPercentage = classData.capacity > 0 
    ? Math.round((classData.students.length / classData.capacity) * 100) 
    : 0;

  const handleExportStudents = () => {
    const csvContent = `NIM,Nama,Email\n${classData.students.map(s => `${s.nim},${s.name},${s.email}`).join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${classData.code}-mahasiswa.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="text-white">
            <h2 className="text-xl font-bold">{classData.name}</h2>
            <p className="text-sm text-blue-100 mt-1">
              {classData.code} • {classData.academicYear} {classData.semester}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl text-gray-900">{classData.students.length}</p>
            <p className="text-sm text-gray-600">Mahasiswa</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl text-gray-900">{classData.courses.length}</p>
            <p className="text-sm text-gray-600">Mata Kuliah</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl text-gray-900">{occupancyPercentage}%</p>
            <p className="text-sm text-gray-600">Hunian</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Courses */}
          <div>
            <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Mata Kuliah ({classData.courses.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {classData.courses.map((course, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>

          {/* Students */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Daftar Mahasiswa ({classData.students.length}/{classData.capacity})
              </h3>
              <button
                onClick={handleExportStudents}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari mahasiswa berdasarkan nama, NIM, atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Student List */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {searchQuery ? 'Tidak ada mahasiswa yang cocok dengan pencarian' : 'Belum ada mahasiswa terdaftar'}
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          NIM
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{student.nim}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{student.email}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredStudents.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Menampilkan {filteredStudents.length} dari {classData.students.length} mahasiswa
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
