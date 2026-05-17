import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Phone, BookOpen, Filter, Upload, Key, Shield } from 'lucide-react';
import { ImportStudentModal } from './ImportStudentModal';
import { AddEditStudentModal } from './AddEditStudentModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { PasswordManagementModal } from './PasswordManagementModal';
import { api } from '../../../services/api';

export function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    api.get<typeof students>('/admin/students')
      .then(setStudents)
      .catch((error) => console.error('Failed to load students:', error));
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || student.semester === parseInt(selectedSemester);
    return matchesSearch && matchesSemester;
  });

  const handleAddStudent = () => {
    setModalMode('add');
    setSelectedStudent(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteStudent = (student: any) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleSaveStudent = async (studentData: any) => {
    if (modalMode === 'edit' && selectedStudent) {
      const updated = await api.put<any>(`/admin/students/${selectedStudent.id}`, { ...selectedStudent, ...studentData });
      setStudents(students.map((student) => student.id === selectedStudent.id ? updated : student));
    } else {
      const created = await api.post<any>('/admin/students', studentData);
      setStudents([...students, created]);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedStudent) {
      await api.delete(`/admin/students/${selectedStudent.id}`);
      setStudents(students.filter((student) => student.id !== selectedStudent.id));
    }
  };

  const handleManagePassword = (student: any) => {
    setSelectedStudent(student);
    setIsPasswordModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedStudent) return;
    const updated = await api.put<any>(`/admin/students/${selectedStudent.id}/reset-password`, {});
    setStudents(students.map((student) => student.id === selectedStudent.id ? updated : student));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-600 mt-1">Kelola data mahasiswa dan informasi akademik</p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Data Mahasiswa</h3>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Import Data</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleAddStudent}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mahasiswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Program Studi</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Kursus</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">{student.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{student.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{student.program}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">Semester {student.semester}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{student.courses.length} kursus</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      student.status === 'Aktif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => handleEditStudent(student)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" onClick={() => handleDeleteStudent(student)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors" onClick={() => handleManagePassword(student)}>
                        <Key className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600">
          Menampilkan <span className="text-gray-900">{filteredStudents.length}</span> dari <span className="text-gray-900">{students.length}</span> mahasiswa
        </div>
      </div>

      {/* Import Student Modal */}
      <ImportStudentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={async (data) => {
          const createdStudents = await Promise.all(
            data.map((student) => api.post<any>('/admin/students', {
              name: student.name,
              email: student.email,
              studentId: student.studentId,
              program: student.program,
              semester: student.semester || 1,
              courses: [],
              status: student.status || 'Aktif',
              password: 'password',
              defaultPassword: 'password',
              isPasswordChanged: false
            }))
          );
          setStudents([...students, ...createdStudents]);
        }}
      />

      {/* Add/Edit Student Modal */}
      <AddEditStudentModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        mode={modalMode}
        student={selectedStudent}
        onAddEdit={handleSaveStudent}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        student={selectedStudent}
        onDelete={handleConfirmDelete}
      />

      {/* Password Management Modal */}
      <PasswordManagementModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userName={selectedStudent?.name || ''}
        userType="Mahasiswa"
        currentPassword={selectedStudent?.password || ''}
        defaultPassword={selectedStudent?.defaultPassword || ''}
        isPasswordChanged={selectedStudent?.isPasswordChanged || false}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
