import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../../services/api';

export function ClassManagement() {
  const [query, setQuery] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/admin/class-management').then((d) => setClasses(d || [])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => classes.filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(query.toLowerCase())), [classes, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Kelola Kelas</h1>
        <p className="text-gray-600 mt-1">Data kelas dari backend API</p>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" placeholder="Cari kelas..." />
        </div>
      </div>

      {loading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat kelas...</div>}
      {!loading && filtered.length === 0 && <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">Belum ada kelas.</div>}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-600">{c.code} • {c.academicYear}</p>
              <p className="text-sm text-gray-600 mt-2">{(c.students || []).length}/{c.capacity} mahasiswa</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
