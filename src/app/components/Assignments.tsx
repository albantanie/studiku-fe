import { useEffect, useState } from 'react';
import { FileText, Calendar, CheckCircle2, Clock, Upload } from 'lucide-react';
import { AssignmentDetail } from './AssignmentDetail';
import { api } from '../../services/api';

export function Assignments() {
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);

  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    api.get<typeof assignments>('/student/assignments')
      .then(setAssignments)
      .catch((error) => console.error('Failed to load assignments:', error));
  }, []);

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    };
    return styles[priority as keyof typeof styles];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'submitted':
        return <Upload className="w-5 h-5 text-blue-500" />;
      case 'graded':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Belum Dikerjakan',
      submitted: 'Sudah Dikumpulkan',
      graded: 'Sudah Dinilai',
    };
    return statusMap[status as keyof typeof statusMap];
  };

  // If assignment is selected, show detail page
  if (selectedAssignment) {
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (assignment) {
      return (
        <AssignmentDetail
          assignment={{
            id: assignment.id,
            title: assignment.title,
            course: assignment.course,
            assistant: assignment.assistant,
            dueDate: assignment.dueDate,
            dueTime: assignment.dueTime,
            status: assignment.status,
            score: assignment.score,
          }}
          onBack={() => setSelectedAssignment(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-1">Tugas & Ujian</h2>
          <p className="text-gray-500">Kelola semua tugas dan deadline Anda</p>
        </div>
        
        {/* Filter Dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="all">Semua</option>
          <option value="pending">Pending</option>
          <option value="submitted">Dikumpulkan</option>
          <option value="graded">Dinilai</option>
        </select>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${assignment.courseColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-gray-900 mb-1">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">{assignment.course}</p>
                  </div>
                  {getStatusIcon(assignment.status)}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {assignment.dueDate}, {assignment.dueTime}</span>
                </div>

                {assignment.status === 'graded' && assignment.score && (
                  <div className="mb-4">
                    <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
                      Nilai: {assignment.score}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{getStatusText(assignment.status)}</span>
                  {assignment.status === 'pending' && (
                    <button 
                      onClick={() => setSelectedAssignment(assignment.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Kerjakan Tugas
                    </button>
                  )}
                  {assignment.status === 'submitted' && (
                    <button 
                      onClick={() => setSelectedAssignment(assignment.id)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Lihat Detail
                    </button>
                  )}
                  {assignment.status === 'graded' && (
                    <button 
                      onClick={() => setSelectedAssignment(assignment.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Lihat Detail
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
