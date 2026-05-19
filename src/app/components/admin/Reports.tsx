import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../../services/api';

export function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/admin/reports').then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 mt-1">Data dari backend API</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><Download className="w-5 h-5" />Export</button>
      </div>
      {loading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat laporan...</div>}
      {!loading && !data && <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">Data kosong.</div>}
      {!loading && data && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          Stats: {(data.stats || []).length} • Course: {(data.coursePerformance || []).length} • Students: {(data.topStudents || []).length}
        </div>
      )}
    </div>
  );
}
