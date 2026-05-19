import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../services/api';
import { reportWorkflow, getReportStatusClass, getReportStatusLabel } from '../../../services/reportWorkflow';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type ApiReport = {
  id: number;
  courseCode: string;
  courseName: string;
  class: string;
  submittedAt: string;
};

export function LecturerReports() {
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
        setError(err instanceof Error ? err.message : 'Gagal memuat laporan dosen');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, ApiReport>();
    for (const r of reports) {
      const key = `${r.courseCode}-${r.class}`;
      if (!m.has(key)) m.set(key, r);
    }
    return [...m.values()];
  }, [reports]);

  const onApprove = async (id: number) => {
    try {
      await reportWorkflow.approveByLecturer(id);
      toast.success('Laporan disetujui');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal approve');
    }
  };

  const onReject = async (id: number) => {
    try {
      await reportWorkflow.rejectByLecturer(id);
      toast.success('Laporan ditolak');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal reject');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Laporan Dosen</h1>
        <p className="text-gray-600 mt-1">Approve laporan dari aslab</p>
      </div>
      {loading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat laporan...</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
      {!loading && !error && grouped.length === 0 && <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">Belum ada laporan.</div>}

      {!loading && !error && grouped.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Kursus</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {grouped.map((r) => {
                const st = reportWorkflow.getStatus(r.id);
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.courseCode} - {r.courseName}</td>
                    <td className="px-4 py-3">{r.class}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${getReportStatusClass(st)}`}>{getReportStatusLabel(st)}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => onApprove(r.id)} disabled={st !== 'SUBMITTED'} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded disabled:opacity-50"><CheckCircle2 className="w-4 h-4" />Approve</button>
                        <button onClick={() => onReject(r.id)} disabled={st !== 'SUBMITTED'} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded disabled:opacity-50"><XCircle className="w-4 h-4" />Reject</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
