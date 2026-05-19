import { useEffect, useState } from 'react';
import { Users, GraduationCap, UserCog } from 'lucide-react';
import { StudentManagement } from './StudentManagement';
import { LecturerManagement } from './LecturerManagement';
import { LabAssistantManagement } from './LabAssistantManagement';
import { api } from '../../../services/api';

export function UserManagement() {
  const [activeTab, setActiveTab] = useState<'students' | 'lecturers' | 'assistants'>('students');
  const [tabs, setTabs] = useState<Array<{ id: 'students' | 'lecturers' | 'assistants'; label: string; icon: any }>>([
    { id: 'students', label: 'Mahasiswa', icon: GraduationCap },
    { id: 'lecturers', label: 'Dosen', icon: Users },
    { id: 'assistants', label: 'Asisten Laboratorium', icon: UserCog },
  ]);

  useEffect(() => {
    api.get<any[]>('/admin/user-tabs')
      .then((data) => {
        const iconMap: Record<string, any> = { students: GraduationCap, lecturers: Users, assistants: UserCog };
        const mapped = (data || [])
          .map((x: any) => ({ id: x.id, label: x.label, icon: iconMap[x.id] || Users }))
          .filter((x: any) => x.id === 'students' || x.id === 'lecturers' || x.id === 'assistants');
        if (mapped.length > 0) setTabs(mapped as any);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-600 mt-1">Kelola mahasiswa, dosen, dan asisten laboratorium</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'lecturers' && <LecturerManagement />}
        {activeTab === 'assistants' && <LabAssistantManagement />}
      </div>
    </div>
  );
}
