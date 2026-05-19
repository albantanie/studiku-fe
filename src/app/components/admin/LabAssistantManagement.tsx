import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Phone, BookOpen, Filter, Clock, Upload, Pencil, Key } from 'lucide-react';
import { AddEditLabAssistantModal } from './AddEditLabAssistantModal';
import { DeleteLabAssistantModal } from './DeleteLabAssistantModal';
import { PasswordManagementModal } from './PasswordManagementModal';
import { ImportLabAssistantModal } from './ImportLabAssistantModal';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface LabAssistant {
  id: number;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  lab: string;
  supervisor: string;
  semester: number;
  gpa: number;
  assignedCourses: number;
  weeklyHours: number;
  status: string;
  joinDate: string;
  password: string;
  defaultPassword: string;
  isPasswordChanged: boolean;
}

export function LabAssistantManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLab, setSelectedLab] = useState('all');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<LabAssistant | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [assistantsData, setAssistantsData] = useState<LabAssistant[]>([]);
  const [labs, setLabs] = useState<string[]>([]);
  const assistants: LabAssistant[] = assistantsData;

  useEffect(() => {
    api.get<LabAssistant[]>('/admin/lab-assistants').then((data) => setAssistantsData(data || [])).catch(() => setAssistantsData([]));
    api.get<any[]>('/admin/labs').then((data) => setLabs((data || []).map((x: any) => x.label || x.value || String(x)))).catch(() => setLabs([]));
  }, []);

  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assistant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assistant.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLab = selectedLab === 'all' || assistant.lab === selectedLab;
    return matchesSearch && matchesLab;
  });

  const handleAddAssistant = () => {
    setModalMode('add');
    setSelectedAssistant(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditAssistant = (assistant: LabAssistant) => {
    setModalMode('edit');
    setSelectedAssistant(assistant);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteAssistant = (assistant: LabAssistant) => {
    setSelectedAssistant(assistant);
    setIsDeleteModalOpen(true);
  };

  const handleSaveAssistant = (assistant: LabAssistant) => {
    // Mock save action
    console.log('Saving assistant:', assistant);
  };

  const handleImportAssistants = async (data: any[]) => {
    setAssistantsData(data || []);
    setIsImportModalOpen(false);
    toast.success('Import data aslab berhasil.');
  };

  const handleConfirmDelete = () => {
    // Mock delete action
    console.log('Deleting assistant:', selectedAssistant);
  };

  const handleManagePassword = (assistant: LabAssistant) => {
    setSelectedAssistant(assistant);
    setIsPasswordModalOpen(true);
  };

  const handleResetPassword = () => {
    console.log('Reset password for assistant:', selectedAssistant);
    // Here you would handle the reset password operation
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-600 mt-1">Kelola asisten lab dan penugasan mereka</p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Data Asisten Laboratorium</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Import Data</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleAddAssistant}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tambah Asisten</span>
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
              placeholder="Cari asisten lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Lab</option>
              {labs.map((lab) => <option key={lab} value={lab}>{lab}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Assistants Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Asisten</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Tugas</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssistants.map((assistant) => (
                <tr key={assistant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">{assistant.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{assistant.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <span>{assistant.studentId}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{assistant.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{assistant.assignedCourses} kursus</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                      assistant.status === 'Aktif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assistant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" onClick={() => handleEditAssistant(assistant)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" onClick={() => handleDeleteAssistant(assistant)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors" onClick={() => handleManagePassword(assistant)}>
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
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600">
          Menampilkan <span className="text-gray-900">{filteredAssistants.length}</span> dari <span className="text-gray-900">{assistants.length}</span> asisten
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Sebelumnya
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddEditLabAssistantModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        mode={modalMode}
        assistant={selectedAssistant}
        onAddEdit={handleSaveAssistant}
      />

      {/* Delete Modal */}
      <DeleteLabAssistantModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        assistantName={selectedAssistant?.name || ''}
        onConfirm={handleConfirmDelete}
      />

      {/* Password Management Modal */}
      <PasswordManagementModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userName={selectedAssistant?.name || ''}
        userType="Asisten Lab"
        currentPassword={selectedAssistant?.password || ''}
        defaultPassword={selectedAssistant?.defaultPassword || ''}
        isPasswordChanged={selectedAssistant?.isPasswordChanged || false}
        onResetPassword={handleResetPassword}
      />

      <ImportLabAssistantModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportAssistants}
      />
    </div>
  );
}
