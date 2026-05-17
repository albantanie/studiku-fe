import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Calendar, Users, CheckCircle, XCircle, Clock, Filter, X, AlertTriangle } from 'lucide-react';
import { api } from '../../../services/api';

export function AssignmentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentForm, setAssignmentForm] = useState<any>({
    title: '',
    course: '',
    instructor: '',
    dueDate: '',
    totalStudents: 0,
    submitted: 0,
    graded: 0,
    pending: 0,
    status: 'Aktif',
    type: 'Tugas'
  });

  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    api.get<typeof assignments>('/admin/assignments')
      .then(setAssignments)
      .catch((error) => console.error('Failed to load assignment management:', error));
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif': return 'bg-blue-100 text-blue-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Project': return 'bg-purple-100 text-purple-800';
      case 'Quiz': return 'bg-yellow-100 text-yellow-800';
      case 'Tugas': return 'bg-blue-100 text-blue-800';
      case 'UTS': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setAssignmentForm({
      title: '',
      course: '',
      instructor: '',
      dueDate: '',
      totalStudents: 0,
      submitted: 0,
      graded: 0,
      pending: 0,
      status: 'Aktif',
      type: 'Tugas'
    });
    setShowEditModal(true);
  };

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setAssignmentForm(assignment);
    setShowEditModal(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssignment) {
      const updated = await api.put<any>(`/admin/assignments/${selectedAssignment.id}`, { ...assignmentForm, id: selectedAssignment.id });
      setAssignments(assignments.map((assignment) => assignment.id === selectedAssignment.id ? updated : assignment));
    } else {
      const created = await api.post<any>('/admin/assignments', assignmentForm);
      setAssignments([...assignments, created]);
    }
    setShowEditModal(false);
    setSelectedAssignment(null);
  };

  const handleDeleteAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;
    await api.delete(`/admin/assignments/${selectedAssignment.id}`);
    setAssignments(assignments.filter((assignment) => assignment.id !== selectedAssignment.id));
    setSelectedAssignment(null);
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Kelola Tugas</h1>
          <p className="text-gray-600 mt-1">Kelola tugas, quiz, dan ujian</p>
        </div>
        <button
          onClick={handleAddAssignment}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Tugas</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Selesai">Selesai</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{assignment.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(assignment.type)}`}>
                        {assignment.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{assignment.course} • {assignment.instructor}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(assignment.dueDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{assignment.totalStudents} mahasiswa</span>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-900">{assignment.submitted}</p>
                      <p className="text-xs text-gray-500">Dikumpulkan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-900">{assignment.graded}</p>
                      <p className="text-xs text-gray-500">Dinilai</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-900">{assignment.pending}</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress Pengumpulan</span>
                    <span>{assignment.totalStudents > 0 ? Math.round((assignment.submitted / assignment.totalStudents) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${assignment.totalStudents > 0 ? (assignment.submitted / assignment.totalStudents) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col items-center gap-2">
                <button
                  onClick={() => handleEditAssignment(assignment)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl text-gray-900">{selectedAssignment ? 'Edit Tugas' : 'Tambah Tugas'}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} placeholder="Judul tugas" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input required value={assignmentForm.course} onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })} placeholder="Kursus" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input required value={assignmentForm.instructor} onChange={(e) => setAssignmentForm({ ...assignmentForm, instructor: e.target.value })} placeholder="Dosen" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <input type="date" required value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <select value={assignmentForm.status} onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Draft">Draft</option>
                </select>
                <select value={assignmentForm.type} onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Tugas">Tugas</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                  <option value="UTS">UTS</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-gray-900 mb-2">Hapus Tugas</h3>
                <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus tugas <span className="font-semibold text-gray-900">"{selectedAssignment?.title}"</span>?</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleConfirmDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Hapus Tugas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
