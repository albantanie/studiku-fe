import { useEffect, useState } from 'react';
import { Search, Calendar, Users, Clock, Filter } from 'lucide-react';
import { api } from '../../../services/api';

export function AssignmentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/admin/assignments').then((d) => setAssignments(d || [])).finally(() => setLoading(false));
  }, []);

  const filtered = assignments.filter((a) => {
    const s = `${a.title} ${a.course}`.toLowerCase();
    const okSearch = s.includes(searchQuery.toLowerCase());
    const okStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return okSearch && okStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Kelola Tugas</h1>
        <p className="text-gray-600 mt-1">Data tugas dari backend API</p>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="Cari tugas..." />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {loading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat tugas...</div>}
      {!loading && filtered.length === 0 && <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">Belum ada tugas.</div>}

      <div className="space-y-4">
        {filtered.map((a) => (
          <div key={a.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-900">{a.title}</h3>
            <p className="text-sm text-gray-600">{a.course} • {a.instructor}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4" />{a.dueDate}</span>
              <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" />{a.totalStudents} mahasiswa</span>
              <span className="inline-flex items-center gap-2"><Clock className="w-4 h-4" />{a.submitted}/{a.totalStudents} submit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
