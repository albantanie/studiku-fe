import { useEffect, useState } from 'react';
import { Search, UserCheck, BookOpen, Plus, Upload, Pencil, Trash2, Key } from 'lucide-react';
import { AddEditLecturerModal } from './AddEditLecturerModal';
import { DeleteLecturerModal } from './DeleteLecturerModal';
import { ImportLecturerModal } from './ImportLecturerModal';
import { PasswordManagementModal } from './PasswordManagementModal';
import { api } from '../../../services/api';

interface Lecturer {
  id: number;
  name: string;
  email: string;
  password: string;
  defaultPassword: string;
  nidn: string;
  courses: string[];
  isPasswordChanged: boolean;
}

export function LecturerManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLecturers();
  }, []);

  const loadLecturers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.get<Lecturer[]>('/admin/lecturers');
      setLecturers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data dosen');
      setLecturers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter lecturers based on search
  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecturer.nidn.includes(searchQuery) ||
    lecturer.courses.some(course => course.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const handleAddLecturer = () => {
    setModalMode('add');
    setSelectedLecturer(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditLecturer = (lecturer: Lecturer) => {
    setModalMode('edit');
    setSelectedLecturer(lecturer);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteLecturer = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setIsDeleteModalOpen(true);
  };

  const handleSaveLecturer = async (lecturer: Lecturer) => {
    setError('');
    try {
      if (modalMode === 'add') {
        await api.post('/admin/lecturers', lecturer);
      } else {
        await api.put(`/admin/lecturers/${selectedLecturer?.id}`, lecturer);
      }
      await loadLecturers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data dosen';
      setError(message);
      throw new Error(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLecturer?.id) return;
    setError('');
    try {
      await api.delete(`/admin/lecturers/${selectedLecturer.id}`);
      await loadLecturers();
      setSelectedLecturer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data dosen');
    }
  };

  const handleImportData = (data: any[]) => {
    setLecturers(data || []);
    setIsImportModalOpen(false);
  };

  const handleManagePassword = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setIsPasswordModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedLecturer?.id) return;
    setError('');
    try {
      await api.put(`/admin/lecturers/${selectedLecturer.id}/reset-password`, {});
      await loadLecturers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal reset password dosen');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-600 mt-1">Kelola data dosen dan informasi akademik</p>
      </div>
      {isLoading && <div className="text-sm text-gray-600">Memuat data dosen...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Title and Action Buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Data Dosen</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Import Data</span>
          </button>
          <button
            onClick={handleAddLecturer}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Dosen</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari dosen berdasarkan nama, email, NIDN, atau mata kuliah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Dosen
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  NIDN
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
                  Mata Kuliah
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLecturers.length > 0 ? (
                filteredLecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-blue-700">
                            {getInitials(lecturer.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{lecturer.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{lecturer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{lecturer.nidn}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {lecturer.courses.slice(0, 2).map((course, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs text-blue-700"
                          >
                            {course}
                          </span>
                        ))}
                        {lecturer.courses.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                            +{lecturer.courses.length - 2} lainnya
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditLecturer(lecturer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLecturer(lecturer)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleManagePassword(lecturer)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Manage Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <UserCheck className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">Tidak ada data dosen ditemukan</p>
                      <p className="text-sm text-gray-400">Coba ubah kata kunci pencarian Anda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredLecturers.length > 0 ? (
            filteredLecturers.map((lecturer) => (
              <div key={lecturer.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-blue-700">
                      {getInitials(lecturer.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-1">{lecturer.name}</p>
                    
                    <p className="text-xs text-gray-600 mb-2">{lecturer.email}</p>

                    <p className="text-xs text-gray-600 mb-3">NIDN: {lecturer.nidn}</p>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">Mata Kuliah:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lecturer.courses.map((course, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs text-blue-700"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleEditLecturer(lecturer)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteLecturer(lecturer)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-sm">Hapus</span>
                      </button>
                      <button
                        onClick={() => handleManagePassword(lecturer)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span className="text-sm">Password</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <UserCheck className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500">Tidak ada data dosen ditemukan</p>
                <p className="text-sm text-gray-400">Coba ubah kata kunci pencarian Anda</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between text-sm text-gray-600">
        <span>Menampilkan {filteredLecturers.length} dari {lecturers.length} dosen</span>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Sebelumnya
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddEditLecturerModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onAddEdit={handleSaveLecturer}
        lecturer={selectedLecturer}
        mode={modalMode}
      />

      <DeleteLecturerModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        lecturerName={selectedLecturer?.name || ''}
      />

      <ImportLecturerModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
      />

      <PasswordManagementModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userName={selectedLecturer?.name || ''}
        userType="Dosen"
        currentPassword={selectedLecturer?.password || ''}
        defaultPassword={selectedLecturer?.defaultPassword || ''}
        isPasswordChanged={selectedLecturer?.isPasswordChanged || false}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
