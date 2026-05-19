import { api } from './api';

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface ReportWorkflowItem {
  courseId: number;
  status: ReportStatus;
  updatedAt: string;
}

const CHANGE_EVENT = 'studiku:report-workflow:changed';

let workflowCache: ReportWorkflowItem[] = [];

function emitChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function upsertStatus(courseId: number, status: ReportStatus) {
  const idx = workflowCache.findIndex((item) => item.courseId === courseId);
  const updatedAt = new Date().toISOString();
  if (idx === -1) {
    workflowCache.push({ courseId, status, updatedAt });
  } else {
    workflowCache[idx] = { ...workflowCache[idx], status, updatedAt };
  }
  emitChange();
}

export const reportWorkflow = {
  loadFromApi: async () => {
    try {
      const data = await api.get<ReportWorkflowItem[]>('/reports/workflow');
      if (Array.isArray(data) && data.length > 0) {
        workflowCache = data;
        emitChange();
      }
      return workflowCache;
    } catch {
      return [];
    }
  },
  getAll: (): ReportWorkflowItem[] => workflowCache,
  getStatus: (courseId: number): ReportStatus => workflowCache.find((item) => item.courseId === courseId)?.status ?? 'DRAFT',
  submitByAssistant: async (courseId: number) => {
    await api.post('/reports/workflow/submit', { courseId });
    upsertStatus(courseId, 'SUBMITTED');
  },
  approveByLecturer: async (courseId: number) => {
    await api.post('/reports/workflow/approve', { courseId });
    upsertStatus(courseId, 'APPROVED');
  },
  rejectByLecturer: async (courseId: number) => {
    await api.post('/reports/workflow/reject', { courseId });
    upsertStatus(courseId, 'REJECTED');
  },
  resetToDraft: async (courseId: number) => {
    await api.post('/reports/workflow/reset', { courseId });
    upsertStatus(courseId, 'DRAFT');
  },
  subscribe: (callback: () => void) => {
    const handler = () => callback();
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  },
};

export function getReportStatusLabel(status: ReportStatus): string {
  if (status === 'DRAFT') return 'Draft';
  if (status === 'SUBMITTED') return 'Menunggu Persetujuan Dosen';
  if (status === 'APPROVED') return 'Disetujui Dosen';
  return 'Ditolak Dosen';
}

export function getReportStatusClass(status: ReportStatus): string {
  if (status === 'DRAFT') return 'bg-gray-100 text-gray-700';
  if (status === 'SUBMITTED') return 'bg-yellow-100 text-yellow-700';
  if (status === 'APPROVED') return 'bg-green-100 text-green-700';
  return 'bg-red-100 text-red-700';
}
