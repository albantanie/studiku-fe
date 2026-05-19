import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AddEditAcademicYearModal } from './AddEditAcademicYearModal';
import { DeleteAcademicYearModal } from './DeleteAcademicYearModal';

interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  semester: string;
  status: 'Aktif' | 'Selesai' | 'Mendatang';
  totalCourses: number;
  totalStudents: number;
}

export function AcademicYearManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
    {
      id: 1,
      name: '2024/2025 Genap',
      startDate: '2025-01-15',
      endDate: '2025-06-30',
      semester: 'Genap',
      status: 'Aktif',
      totalCourses: 48,
      totalStudents: 1234
    },
    {
      id: 2,
      name: '2024/2025 Ganjil',
      startDate: '2024-08-15',
      endDate: '2024-12-31',
      semester: 'Ganjil',
      status: 'Selesai',
      totalCourses: 45,
      totalStudents: 1189
    },
    {
      id: 3,
      name: '2025/2026 Ganjil',
      startDate: '2025-08-15',
      endDate: '2025-12-31',
      semester: 'Ganjil',
      status: 'Mendatang',
      totalCourses: 0,
      totalStudents: 0
    },
    {
      id: 4,
      name: '2023/2024 Genap',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      semester: 'Genap',
      status: 'Selesai',
      totalCourses: 42,
      totalStudents: 1098
    },
  ]);

  const filteredYears = academicYears.filter(year =>
    year.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to calculate status based on dates
  const calculateStatus = (startDate: string, endDate: string): 'Aktif' | 'Selesai' | 'Mendatang' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) {
      return 'Mendatang';
    } else if (today >= start && today <= end) {
      return 'Aktif';
    } else {
      return 'Selesai';
    }
  };

  const handleAddYear = () => {
    setSelectedYear(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditYear = (year: AcademicYear) => {
    setSelectedYear(year);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteYear = (year: AcademicYear) => {
    setYearToDelete(year);
    setIsDeleteModalOpen(true);
  };

  const handleSaveYear = (yearData: Omit<AcademicYear, 'id' | 'totalCourses' | 'totalStudents' | 'status'>) => {
    // Calculate status automatically based on dates
    const status = calculateStatus(yearData.startDate, yearData.endDate);
    
    if (selectedYear) {
      // Edit existing year
      setAcademicYears(academicYears.map(y =>
        y.id === selectedYear.id 
          ? { ...yearData, status, id: selectedYear.id, totalCourses: selectedYear.totalCourses, totalStudents: selectedYear.totalStudents }
          : y
      ));
    } else {
      // Add new year
      const newYear: AcademicYear = {
        ...yearData,
        status,
        id: Math.max(...academicYears.map(y => y.id)) + 1,
        totalCourses: 0,
        totalStudents: 0
      };
      setAcademicYears([newYear, ...academicYears]);
    }
    setIsAddEditModalOpen(false);
    setSelectedYear(null);
  };

  const handleConfirmDelete = () => {
    if (yearToDelete) {
      setAcademicYears(academicYears.filter(y => y.id !== yearToDelete.id));
      setIsDeleteModalOpen(false);
      setYearToDelete(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Aktif':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Selesai':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'Mendatang':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Selesai':
        return 'bg-gray-100 text-gray-800';
      case 'Mendatang':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900">Kelola Tahun Akademik</h1>
          <p className="text-gray-600 mt-1">Kelola periode tahun akademik dan semester</p>
        </div>
        <button
          onClick={handleAddYear}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Tahun Akademik</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tahun akademik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Academic Years List */}
      {filteredYears.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 mb-2">Tidak ada tahun akademik ditemukan</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan tahun akademik baru'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddYear}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Tahun Akademik
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tahun Akademik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Kursus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total Mahasiswa
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredYears.map((year) => (
                  <tr key={year.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(year.status)}
                        <span className="text-sm text-gray-900 font-medium">{year.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{year.semester}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(year.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(year.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded text-xs ${getStatusBadge(year.status)}`}>
                        {year.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{year.totalCourses}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{year.totalStudents}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditYear(year)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteYear(year)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={year.status === 'Aktif'}
                          title={year.status === 'Aktif' ? 'Tahun akademik aktif tidak dapat dihapus' : 'Hapus'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditAcademicYearModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedYear(null);
        }}
        onSave={handleSaveYear}
        academicYear={selectedYear}
      />

      <DeleteAcademicYearModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setYearToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        yearName={yearToDelete?.name || ''}
      />
    </div>
  );
}