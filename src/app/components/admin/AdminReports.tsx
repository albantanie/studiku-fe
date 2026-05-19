import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../services/api';
import { reportWorkflow, getReportStatusClass, getReportStatusLabel } from '../../../services/reportWorkflow';
import { Download } from 'lucide-react';

type ApiReport = {
  id: number;
  courseCode: string;
  courseName: string;
  class: string;
  submittedAt: string;
  nim: string;
  name: string;
  status: string;
  score: number | null;
};

export function AdminReports() {
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setVersion] = useState(0);

  useEffect(() => {
    const un = reportWorkflow.subscribe(() => setVersion((v) => v + 1));
    return un;
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await reportWorkflow.loadFromApi();
        const payload = await api.get<any>('/assistant/reports');
        setReports(payload?.reports || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat laporan admin');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const approved = useMemo(() => reports.filter((r) => reportWorkflow.getStatus(r.id) === 'APPROVED'), [reports]);

  const onExport = () => {
    const rows = ['courseCode,courseName,class,nim,name,submittedAt,score'];
    for (const r of approved) rows.push(`${r.courseCode},${r.courseName},${r.class},${r.nim},${r.name},${r.submittedAt},${r.score ?? ''}`);
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-approved-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Laporan Admin</h1>
          <p className="text-gray-600 mt-1">Hanya laporan status approved dosen</p>
        </div>
        <button onClick={onExport} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {loading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat laporan...</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
      {!loading && !error && approved.length === 0 && <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">Belum ada laporan approved.</div>}

      {!loading && !error && approved.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Kursus</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Mahasiswa</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Nilai</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approved.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.courseCode} - {r.courseName}</td>
                  <td className="px-4 py-3">{r.class}</td>
                  <td className="px-4 py-3">{r.nim} - {r.name}</td>
                  <td className="px-4 py-3">{r.score ?? '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${getReportStatusClass('APPROVED')}`}>{getReportStatusLabel('APPROVED')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
