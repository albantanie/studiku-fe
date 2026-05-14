import { X, Calendar, Upload, CheckCircle2, AlertCircle, FileText, Paperclip } from 'lucide-react';
import { useState } from 'react';

interface AssignmentModalProps {
  assignment: {
    id: number;
    title: string;
    deadline: string;
    status: string;
  };
  onClose: () => void;
}

export function AssignmentModal({ assignment, onClose }: AssignmentModalProps) {
  const [fileName, setFileName] = useState<string>('');
  const [submitMode, setSubmitMode] = useState<'write' | 'upload'>('write'); // Default to write mode
  const [answerText, setAnswerText] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const isSubmitted = assignment.status === 'submitted';

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900">{assignment.title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Deadline: {assignment.deadline}</span>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  isSubmitted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {isSubmitted ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Description */}
          <div>
            <h4 className="text-sm text-gray-900 mb-2">Deskripsi Tugas</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Buatlah analisis kompleksitas waktu dan ruang untuk algoritma yang telah dipelajari. 
              Sertakan penjelasan detail untuk setiap kasus (best case, average case, worst case). 
              Tambahkan juga contoh implementasi kode dan visualisasi diagram jika diperlukan.
            </p>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-sm text-gray-900 mb-2">Instruksi Pengumpulan</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Format file: PDF atau DOCX</li>
              <li>Ukuran maksimal: 10 MB</li>
            </ul>
          </div>

          {isSubmitted ? (
            /* Already Submitted */
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 mb-1">Tugas telah dikumpulkan</p>
                    <p className="text-xs text-green-600">
                      File: Assignment_12345678.pdf • Dikumpulkan pada 14 Jan 2026, 15:30
                    </p>
                    <button className="mt-3 text-sm text-green-700 hover:text-green-800 underline">
                      Lihat Submission
                    </button>
                  </div>
                </div>
              </div>

              {/* Grade Section - Only show if graded */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Nilai Tugas</p>
                <p className="text-5xl text-blue-600">95</p>
              </div>
            </div>
          ) : (
            /* Submit Form with Tabs */
            <div>
              <h4 className="text-sm text-gray-900 mb-3">Kumpulkan Tugas</h4>
              
              {/* Warning if close to deadline */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Deadline dalam 3 hari. Pastikan untuk mengumpulkan tugas tepat waktu!
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSubmitMode('write')}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    submitMode === 'write'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Tulis Jawaban</span>
                </button>
                <button
                  onClick={() => setSubmitMode('upload')}
                  className={`flex-1 py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    submitMode === 'upload'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Upload File</span>
                </button>
              </div>

              {/* Write Mode */}
              {submitMode === 'write' && (
                <div>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Tulis jawaban tugas Anda di sini..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">{answerText.length} karakter</p>
                </div>
              )}

              {/* Upload Mode */}
              {submitMode === 'upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    {fileName ? (
                      <div>
                        <p className="text-sm text-gray-900 mb-1">{fileName}</p>
                        <p className="text-xs text-gray-500">Klik untuk mengganti file</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          Klik untuk upload atau drag & drop
                        </p>
                        <p className="text-xs text-gray-500">PDF atau DOCX (Maks. 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={submitMode === 'write' ? !answerText.trim() : !fileName}
                className={`w-full mt-4 py-2.5 rounded-lg transition-colors ${
                  (submitMode === 'write' ? answerText.trim() : fileName)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Kumpulkan Tugas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}