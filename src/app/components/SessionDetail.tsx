import { ArrowLeft, Calendar, Clock, MapPin, Video, FileText, ClipboardList, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MaterialModal } from './MaterialModal';
import { AssignmentModal } from './AssignmentModal';
import { getMaterialDownloadUrl } from '../../services/fileService';
import { api } from '../../services/api';

interface SessionDetailProps {
  session: {
    id: number;
    sessionName: string;
    topic: string;
    date: string;
    time: string;
    type: 'online' | 'offline';
    conferenceLink?: string;
  };
  onBack: () => void;
}

export function SessionDetail({ session, onBack }: SessionDetailProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>(`/student/sessions/${session.id}/detail`).then((data) => {
      setMaterials((data?.materials || []).map((m: any) => ({ ...m, fileUrl: getMaterialDownloadUrl(m.id) })));
      setAssignments(data?.assignments || []);
    }).catch(() => {
      setMaterials([]);
      setAssignments([]);
    });
  }, [session.id]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali ke Daftar Sesi</span>
      </button>

      {/* Card 1: Session Info */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-gray-900 mb-4">{session.sessionName}</h2>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Topik Materi</p>
            <p className="text-gray-900">{session.topic}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Tanggal dan Waktu</p>
            <div className="flex items-center gap-4 text-gray-900">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{session.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{session.time}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Tipe Sesi</p>
            <div className="flex items-center gap-2">
              {session.type === 'online' ? (
                <>
                  <Video className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">Online</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Materials, Assignments, and Conference Link */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="space-y-6">
          {/* Conference Link - Only for online sessions */}
          {session.type === 'online' && session.conferenceLink && (
            <div>
              <h3 className="text-gray-900 mb-3">Link Conference</h3>
              <a
                href={session.conferenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Gabung Kelas Online</p>
                    <p className="text-xs text-gray-500">Klik untuk membuka meeting</p>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-blue-500" />
              </a>
            </div>
          )}

          {/* Materials */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="text-gray-900">Materi</h3>
            </div>
            <div className="space-y-2">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{material.title}</p>
                      <p className="text-xs text-gray-500">{material.type} • {material.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMaterial(material)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Lihat
                    </button>
                    {material.fileUrl ? (
                      <a
                        href={material.fileUrl}
                        download
                        className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Download Materi
                      </a>
                    ) : (
                      <button
                        disabled
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                        title="File materi belum tersedia"
                      >
                        Materi Belum Ada
                      </button>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-gray-400" />
              <h3 className="text-gray-900">Tugas</h3>
            </div>
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">{assignment.title}</p>
                      <p className="text-xs text-gray-500">Deadline: {assignment.deadline}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        assignment.status === 'submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {assignment.status === 'submitted' ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Material Modal */}
      {selectedMaterial && (
        <MaterialModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}

      {/* Assignment Modal */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
}
