import { Calendar, CheckCircle2, AlertCircle, ArrowLeft, Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../services/api';

interface AssignmentDetailProps {
  assignment: {
    id: number;
    title: string;
    course: string;
    assistant: string;
    dueDate: string;
    dueTime: string;
    status: string;
    score?: number;
  };
  onBack: () => void;
}

export function AssignmentDetail({ assignment, onBack }: AssignmentDetailProps) {
  const [answer, setAnswer] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(assignment.status === 'submitted' || assignment.status === 'graded');
  
  const isSubmitted = submitted;
  const isGraded = assignment.status === 'graded';

  const handleSubmitAssignment = async () => {
    if (!answer.trim()) return;
    await api.put(`/student/assignments/${assignment.id}/submit`, {
      answer,
      fileName: selectedFile?.name || '',
    });
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali ke Daftar Tugas</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <h2 className="text-gray-900 mb-4">{assignment.title}</h2>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="text-gray-500">Mata Kuliah:</span> {assignment.course}
          </p>
          <p className="text-sm text-gray-600">
            <span className="text-gray-500">Asisten Lab:</span> {assignment.assistant}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {assignment.dueDate}, {assignment.dueTime}</span>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-md ${
              isSubmitted
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {isSubmitted ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <h3 className="text-gray-900 mb-3">Deskripsi Tugas</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Buatlah analisis kompleksitas waktu dan ruang untuk algoritma yang telah dipelajari. 
          Sertakan penjelasan detail untuk setiap kasus (best case, average case, worst case). 
          Tambahkan juga contoh implementasi kode dan visualisasi diagram jika diperlukan.
        </p>
      </div>

      {/* Submission Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4">Kumpulkan Tugas</h3>

        {!isSubmitted && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Deadline dalam 3 hari. Pastikan untuk mengumpulkan tugas tepat waktu!
            </p>
          </div>
        )}

        {isSubmitted && isGraded && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Nilai Tugas</p>
            <p className="text-4xl text-blue-600">{assignment.score || 95}</p>
          </div>
        )}

        {/* Text Editor */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">
            Tulis jawaban Anda di sini:
          </label>
          <textarea
            value={isSubmitted ? 'Analisis Kompleksitas Algoritma\n\n1. Best Case Analysis\nPada kasus terbaik, algoritma linear search akan menemukan elemen yang dicari pada posisi pertama array. Kompleksitas waktu: O(1)\n\n2. Average Case Analysis\nPada kasus rata-rata, elemen yang dicari berada di tengah-tengah array. Kompleksitas waktu: O(n/2) yang disederhanakan menjadi O(n)\n\n3. Worst Case Analysis\nPada kasus terburuk, elemen berada di posisi terakhir atau tidak ada dalam array. Kompleksitas waktu: O(n)\n\nKompleksitas ruang: O(1) karena hanya menggunakan variabel konstan untuk pencarian.\n\nContoh Implementasi:\n```python\ndef linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1\n```\n\nDari analisis di atas, dapat disimpulkan bahwa linear search adalah algoritma yang efisien untuk dataset kecil namun tidak optimal untuk dataset besar.' : answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitted}
            placeholder="Ketik jawaban Anda di sini..."
            className={`w-full min-h-[300px] p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              isSubmitted ? 'bg-gray-50 text-gray-700' : 'bg-white text-gray-900'
            }`}
          />
          {!isSubmitted && (
            <p className="text-xs text-gray-500 mt-2">
              {answer.length} karakter
            </p>
          )}
        </div>

        {/* File Upload Card */}
        {!isSubmitted && (
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              Lampiran File (Opsional):
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Klik untuk upload file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, ZIP (Max 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.zip"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </label>
            {selectedFile && (
              <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm text-gray-700 block">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Display uploaded file for submitted assignments */}
        {isSubmitted && (
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">
              File yang telah dikumpulkan:
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <span className="text-sm text-gray-700 block">tugas_algoritma_analysis.pdf</span>
                <span className="text-xs text-gray-500">324.5 KB</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <button
            onClick={handleSubmitAssignment}
            disabled={!answer.trim()}
            className={`w-full py-3 rounded-lg transition-colors ${
              answer.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Kumpulkan Tugas
          </button>
        )}

        {/* Submitted Status */}
        {isSubmitted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800">
                Tugas telah berhasil dikumpulkan
              </p>
              <p className="text-xs text-green-600 mt-1">
                Dikumpulkan pada: 14 Jan 2026, 15:30
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
