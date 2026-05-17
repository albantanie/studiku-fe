import { useEffect, useState } from 'react';
import { FileText, Search, Filter, Calendar, Eye, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../../services/api';

interface Report {
  id: number;
  nim: string;
  name: string;
  courseCode: string;
  courseName: string;
  class: string;
  week: number;
  topic: string;
  submittedAt: string;
  status: 'Menunggu Review' | 'Disetujui' | 'Revisi' | 'Ditolak';
  score?: number;
  fileName: string;
  fileSize: string;
}

interface ReportSummary {
  courseCode: string;
  courseName: string;
  class: string;
  totalReports: number;
  reviewed: number;
  pending: number;
  approved: number;
  needsRevision: number;
}

export function AssistantReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'summary'>('submissions');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState<Report['status']>('Disetujui');

  const [reports, setReports] = useState<Report[]>([]);

  const [reportSummary, setReportSummary] = useState<ReportSummary[]>([]);

  useEffect(() => {
    api.get<{ reports: Report[]; reportSummary: ReportSummary[] }>('/assistant/reports')
      .then((data) => {
        setReports(data.reports);
        setReportSummary(data.reportSummary);
      })
      .catch((error) => console.error('Failed to load assistant reports:', error));
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || report.courseCode === filterCourse;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setReviewScore(report.score?.toString() || '');
    setReviewFeedback('');
    setReviewStatus(report.status === 'Menunggu Review' ? 'Disetujui' : report.status);
    setShowDetailModal(true);
  };

  const handleSaveReview = async () => {
    if (!selectedReport || !reviewScore) return;
    const updated = {
      ...selectedReport,
      score: Number(reviewScore),
      status: reviewStatus,
    };
    await api.put(`/assistant/reports/${selectedReport.id}/review`, {
      score: updated.score,
      status: updated.status,
      feedback: reviewFeedback,
    });
    setReports(reports.map((report) => report.id === updated.id ? updated : report));
    setSelectedReport(updated);
    setShowDetailModal(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'Menunggu Review': 'bg-yellow-100 text-yellow-700',
      'Disetujui': 'bg-green-100 text-green-700',
      'Revisi': 'bg-orange-100 text-orange-700',
      'Ditolak': 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Menunggu Review':
        return <Clock className="w-4 h-4" />;
      case 'Disetujui':
        return <CheckCircle className="w-4 h-4" />;
      case 'Revisi':
        return <AlertCircle className="w-4 h-4" />;
      case 'Ditolak':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Laporan Praktikum</h1>
        <p className="text-gray-600 mt-1">Kelola dan review laporan praktikum mahasiswa</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
              <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Menunggu Review</p>
              <p className="text-3xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'Menunggu Review').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Disetujui</p>
              <p className="text-3xl font-bold text-green-600">
                {reports.filter(r => r.status === 'Disetujui').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Perlu Revisi</p>
              <p className="text-3xl font-bold text-orange-600">
                {reports.filter(r => r.status === 'Revisi').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daftar Laporan
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ringkasan
            </button>
          </div>
        </div>

        {activeTab === 'submissions' ? (
          <>
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari mahasiswa, NIM, atau topik..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter Course */}
                <div className="sm:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="all">Semua Kursus</option>
                      <option value="TIF101">TIF101 - Pemrograman Dasar</option>
                      <option value="TIF102">TIF102 - Struktur Data</option>
                      <option value="TIF201">TIF201 - Basis Data</option>
                    </select>
                  </div>
                </div>

                {/* Filter Status */}
                <div className="sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Menunggu Review">Menunggu Review</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Revisi">Perlu Revisi</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Mahasiswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Praktikum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Waktu Submit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nilai
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.name}</p>
                          <p className="text-xs text-gray-500">{report.nim}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {report.courseCode}
                            </span>
                            <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                              {report.class}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">Minggu {report.week} - {report.topic}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-900">{report.fileName}</p>
                            <p className="text-xs text-gray-500">{report.fileSize}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(report.submittedAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {report.score ? (
                          <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                            {report.score}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetail(report)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {reportSummary.map((summary) => (
                <div key={summary.courseCode} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {summary.courseCode}
                        </span>
                        <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {summary.class}
                        </span>
                      </div>
                      <h3 className="text-gray-900 font-semibold">{summary.courseName}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">{summary.totalReports}</p>
                      <p className="text-xs text-gray-600 mt-1">Total</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
                      <p className="text-xs text-gray-600 mt-1">Disetujui</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
                      <p className="text-xs text-gray-600 mt-1">Pending</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600">{summary.needsRevision}</p>
                      <p className="text-xs text-gray-600 mt-1">Revisi</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {activeTab === 'submissions' && filteredReports.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">Tidak ada laporan ditemukan</h3>
          <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedReport.courseCode}
                    </span>
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      {selectedReport.class}
                    </span>
                    <span className="inline-flex px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded">
                      Minggu {selectedReport.week}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedReport.courseName}</h2>
                  <p className="text-blue-100 mt-1">{selectedReport.topic}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-3">Informasi Mahasiswa</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">NIM</p>
                    <p className="text-gray-900 font-medium">{selectedReport.nim}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nama</p>
                    <p className="text-gray-900 font-medium">{selectedReport.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Waktu Submit</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedReport.submittedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedReport.status)}`}>
                      {getStatusIcon(selectedReport.status)}
                      {selectedReport.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-3">File Laporan</h3>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedReport.fileName}</p>
                      <p className="text-xs text-gray-500">{selectedReport.fileSize}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div>
                <h3 className="text-gray-900 font-semibold mb-3">Review & Penilaian</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reviewScore}
                      onChange={(e) => setReviewScore(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan nilai..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Review
                    </label>
                    <textarea
                      rows={4}
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Berikan feedback untuk mahasiswa..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Review
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as Report['status'])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Disetujui">Disetujui</option>
                      <option value="Revisi">Perlu Revisi</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveReview}
                disabled={!reviewScore}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
