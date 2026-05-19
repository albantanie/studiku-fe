import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../services/api';
import { reportWorkflow, getReportStatusClass, getReportStatusLabel } from '../../../services/reportWorkflow';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

type ApiReport = {
  id: number;
  nim: string;
  name: string;
  courseCode: string;
  courseName: string;
  class: string;
  week: string;
  topic: string;
  submittedAt: string;
  status: string;
  score: number | null;
  fileName: string;
  fileSize: string;
};

export function AssistantReports() {
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
        setError(err instanceof Error ? err.message : 'Gagal memuat laporan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, ApiReport[]>();
    for (const r of reports) {
      const key = `${r.courseCode}-${r.class}`;
      const arr = m.get(key) || [];
      arr.push(r);
      m.set(key, arr);
    }
    return [...m.entries()].map(([key, items]) => ({
      key,
      courseCode: items[0]?.courseCode || '-',
      courseName: items[0]?.courseName || '-',
      className: items[0]?.class || '-',
      total: items.length,
      latestAt: items[0]?.submittedAt || '-',
      workflowStatus: reportWorkflow.getStatus(items[0]?.id || 0),
      reportId: items[0]?.id || 0,
    }));
  }, [reports]);

  const onSend = async (reportId: number) => {
    try {
      await reportWorkflow.submitByAssistant(reportId);
      toast.success('Laporan dikirim ke dosen');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal kirim laporan');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Laporan Aslab</h1>
        <p className="text-gray-600 mt-1">Data laporan dari backend API</p>
      </div>

      {loading && <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-500">Memuat laporan...</div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}
      {!loading && !error && grouped.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-gray-500">Belum ada laporan.</div>
      )}

      {!loading && !error && grouped.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Kursus</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Jumlah</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {grouped.map((row) => (
                <tr key={row.key}>
                  <td className="px-4 py-3">{row.courseCode} - {row.courseName}</td>
                  <td className="px-4 py-3">{row.className}</td>
                  <td className="px-4 py-3">{row.total}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getReportStatusClass(row.workflowStatus)}`}>
                      {getReportStatusLabel(row.workflowStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSend(row.reportId)}
                      disabled={row.workflowStatus === 'SUBMITTED' || row.workflowStatus === 'APPROVED'}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" /> Kirim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
