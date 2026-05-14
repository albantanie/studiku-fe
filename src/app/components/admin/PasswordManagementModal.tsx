import { useState } from 'react';
import { X, Eye, EyeOff, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface PasswordManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userType: 'Mahasiswa' | 'Dosen' | 'Asisten Lab';
  currentPassword: string;
  defaultPassword: string;
  isPasswordChanged: boolean;
  onResetPassword: () => void;
}

export function PasswordManagementModal({
  isOpen,
  onClose,
  userName,
  userType,
  currentPassword,
  defaultPassword,
  isPasswordChanged,
  onResetPassword
}: PasswordManagementModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDefaultPassword, setShowDefaultPassword] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    onResetPassword();
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl text-gray-900">Manajemen Password</h2>
          <button
          disabled
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{userType}</p>
              </div>
            </div>
          </div>

          {/* Password Status */}
          <div className="space-y-4">
            {isPasswordChanged && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Password Telah Diubah</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    User telah mengubah password dari password default
                  </p>
                </div>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  readOnly
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Default Password */}
            {isPasswordChanged && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Default (Awal)
                </label>
                <div className="relative">
                  <input
                    type={showDefaultPassword ? 'text' : 'password'}
                    value={defaultPassword}
                    readOnly
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowDefaultPassword(!showDefaultPassword)}
                  >
                    {showDefaultPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Section */}
          {isPasswordChanged && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Reset ke Password Default</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Mengembalikan password ke password default yang diatur oleh admin
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw  className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          )}

          {!isPasswordChanged && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Password Default Aktif</p>
                <p className="text-xs text-green-700 mt-0.5">
                  User masih menggunakan password default
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}