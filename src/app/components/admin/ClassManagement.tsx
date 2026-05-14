import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, BookOpen, Eye, UserPlus } from 'lucide-react';
import { AddEditClassModal } from './AddEditClassModal';
import { DeleteClassModal } from './DeleteClassModal';
import { ClassDetailModal } from './ClassDetailModal';
import { api } from '../../../services/api';

interface Student {
  id: number;
  name: string;
  nim: string;
  email: string;
}

interface Class {
  id: number;
  name: string;
  code: string;
  academicYear: string;
  semester: string;
  capacity: number;
  students: Student[];
  courses: string[];
}

export function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    api.get<Class[]>('/admin/class-management')
      .then(setClasses)
      .catch((error) => console.error('Failed to load class management:', error));
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClass = () => {
    setSelectedClass(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteClass = (cls: Class) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetail = (cls: Class) => {
    setSelectedClass(cls);
    setIsDetailModalOpen(true);
  };

  const handleSaveClass = (classData: Omit<Class, 'id' | 'students'>) => {
    if (selectedClass) {
      // Edit existing class
      setClasses(classes.map(c =>
        c.id === selectedClass.id
          ? { ...classData, id: selectedClass.id, students: selectedClass.students }
          : c
      ));
    } else {
      // Add new class
      const newClass: Class = {
        ...classData,
        id: Math.max(...classes.map(c => c.id)) + 1,
        students: []
      };
      setClasses([...classes, newClass]);
    }
    setIsAddEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      setClasses(classes.filter(c => c.id !== classToDelete.id));
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };

  // Statistics
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0);
  const averageOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900">Kelola Kelas</h1>
          <p className="text-gray-600 mt-1">Kelola kelas dan daftar mahasiswa</p>
        </div>
        <button
          onClick={handleAddClass}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Kelas</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Kelas</p>
              <p className="text-2xl text-gray-900 mt-1">{classes.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mahasiswa</p>
              <p className="text-2xl text-gray-900 mt-1">{totalStudents}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kapasitas Total</p>
              <p className="text-2xl text-gray-900 mt-1">{totalCapacity}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Hunian</p>
              <p className="text-2xl text-gray-900 mt-1">{averageOccupancy}%</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kelas berdasarkan nama atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 mb-2">Tidak ada kelas ditemukan</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan menambahkan kelas baru'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAddClass}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Kelas Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const occupancyPercentage = cls.capacity > 0 ? Math.round((cls.students.length / cls.capacity) * 100) : 0;
            const isNearFull = occupancyPercentage >= 80;
            const isFull = occupancyPercentage >= 100;

            return (
              <div key={cls.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">{cls.name}</h3>
                      <p className="text-sm text-gray-600">{cls.code}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isFull 
                        ? 'bg-red-100 text-red-800' 
                        : isNearFull 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isFull ? 'Penuh' : isNearFull ? 'Hampir Penuh' : 'Tersedia'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{cls.academicYear} - {cls.semester}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{cls.students.length} / {cls.capacity} mahasiswa</span>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Hunian Kelas</span>
                      <span>{occupancyPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isFull 
                            ? 'bg-red-600' 
                            : isNearFull 
                            ? 'bg-yellow-600' 
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Course Tags */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Mata Kuliah ({cls.courses.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {cls.courses.slice(0, 2).map((course, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {course}
                        </span>
                      ))}
                      {cls.courses.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded">
                          +{cls.courses.length - 2} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetail(cls)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleEditClass(cls)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddEditClassModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setSelectedClass(null);
        }}
        onSave={handleSaveClass}
        classData={selectedClass}
      />

      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClassToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        className={classToDelete?.name || ''}
        classCode={classToDelete?.code || ''}
      />

      <ClassDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClass(null);
        }}
        classData={selectedClass}
      />
    </div>
  );
}
