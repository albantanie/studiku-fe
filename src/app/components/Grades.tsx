import { useEffect, useState } from 'react';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../services/api';

export function Grades() {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesters, setSemesters] = useState<Array<{ id: string; name: string }>>([]);

  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const sem = await api.get<any[]>('/student/grade-semesters');
        const semList = (sem || []).map((x: any) => ({ id: x.id || x.value || x.semester, name: x.name || x.label || x.semester || x.value }));
        setSemesters(semList);
        if (semList.length > 0) setSelectedSemester(semList[0].id);
        const data = await api.get<any[]>('/student/grades');
        setGrades(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat nilai');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredGrades = selectedSemester ? grades.filter((grade) => grade.semester === selectedSemester) : grades;

  const calculateGPA = (gradesList: typeof grades) => {
    const gradePoints: { [key: string]: number } = {
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    gradesList.forEach((grade) => {
      totalPoints += gradePoints[grade.grade] * grade.credits;
      totalCredits += grade.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-700 border-green-200';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const currentGPA = calculateGPA(filteredGrades);
  const overallGPA = calculateGPA(grades);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-1">Nilai Akademik</h2>
          <p className="text-gray-500">Lihat semua nilai dan prestasi akademikmu</p>
        </div>
        
        {/* Tahun Akademik Dropdown */}
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
        >
          {semesters.map((semester) => (
            <option key={semester.id} value={semester.id}>
              Tahun Akademik {semester.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grades Table */}
      {isLoading && <div className="text-sm text-gray-600">Memuat nilai...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Mata Kuliah</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Kode</th>
                <th className="px-6 py-4 text-center text-sm text-gray-600">SKS</th>
                <th className="px-6 py-4 text-center text-sm text-gray-600">Nilai Angka</th>
                <th className="px-6 py-4 text-center text-sm text-gray-600">Nilai Huruf</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!isLoading && !error && filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Belum ada nilai pada semester ini.
                  </td>
                </tr>
              )}
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${grade.color}`}></div>
                      <span className="text-gray-900">{grade.courseName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{grade.code}</td>
                  <td className="px-6 py-4 text-center text-gray-900">{grade.credits}</td>
                  <td className="px-6 py-4 text-center text-gray-900">{grade.score}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg border text-sm ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
