import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Courses } from './components/Courses';
import { Assignments } from './components/Assignments';
import { Grades } from './components/Grades';
import { AuthUser, Login } from './components/Login';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { LecturerManagement } from './components/admin/LecturerManagement';
import { LabAssistantManagement } from './components/admin/LabAssistantManagement';
import { CourseManagement } from './components/admin/CourseManagement';
import { AcademicYearManagement } from './components/admin/AcademicYearManagement';
import { ClassData } from './components/admin/ClassData';
import { AdminReports } from './components/admin/AdminReports';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';
import { LecturerCourses } from './components/lecturer/LecturerCourses';
import { LecturerAttendance } from './components/lecturer/LecturerAttendance';
import { LecturerGrades } from './components/lecturer/LecturerGrades';
import { LecturerReports } from './components/lecturer/LecturerReports';
import { AssistantDashboard } from './components/assistant/AssistantDashboard';
import { AssistantPracticals } from './components/assistant/AssistantPracticals';
import { AssistantAttendance } from './components/assistant/AssistantAttendance';
import { AssistantReports } from './components/assistant/AssistantReports';
import { LayoutDashboard, FileText, Award, Menu, X, LogOut, Settings, Bell, BookOpen, GraduationCap, Users, ChevronDown, ChevronRight, UserCog, Calendar, Database } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userMenuExpanded, setUserMenuExpanded] = useState(true);
  const AUTH_STORAGE_KEY = 'studiku:auth-session';
  const userRole = currentUser?.role ?? 'student';
  const isValidRole = (role: unknown): role is AuthUser['role'] =>
    role === 'student' || role === 'admin' || role === 'lecturer' || role === 'assistant';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const session = JSON.parse(raw) as AuthUser;
      if (Number.isFinite(session?.id) && session?.name && session?.email && isValidRole(session.role)) {
        setIsLoggedIn(true);
        setCurrentUser(session);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsLoggedIn(false);
      setActiveTab('dashboard');
      setCurrentUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    };
    window.addEventListener('studiku:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('studiku:auth-expired', handleAuthExpired);
  }, []);

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setActiveTab('courses');
  };

  const handleLogin = (user: AuthUser) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Kursus', icon: BookOpen },
    { id: 'assignments', label: 'Tugas', icon: FileText },
    { id: 'grades', label: 'Nilai', icon: Award },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academic-year', label: 'Tahun Akademik', icon: Calendar },
    { id: 'class-data', label: 'Data Kelas', icon: Database },
    { id: 'courses', label: 'Kelola Kursus', icon: BookOpen },
    { id: 'reports', label: 'Laporan', icon: FileText },
  ];

  const lecturerMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Kursus', icon: BookOpen },
    { id: 'attendance', label: 'Presensi', icon: UserCog },
    { id: 'grades', label: 'Nilai', icon: Award },
    { id: 'reports', label: 'Laporan', icon: FileText },
  ];

  const assistantMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practicals', label: 'Kursus', icon: BookOpen },
    { id: 'attendance', label: 'Presensi', icon: UserCog },
    { id: 'reports', label: 'Laporan', icon: FileText },
  ];

  const adminUserSubMenu = [
    { id: 'users-students', label: 'Mahasiswa', icon: GraduationCap },
    { id: 'users-lecturers', label: 'Dosen', icon: Users },
    { id: 'users-assistants', label: 'Asisten Laboratorium', icon: UserCog },
  ];

  const menuItems = 
    userRole === 'admin' ? adminMenuItems : 
    userRole === 'lecturer' ? lecturerMenuItems :
    userRole === 'assistant' ? assistantMenuItems :
    studentMenuItems;

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const getUserName = () => {
    return currentUser?.name || currentUser?.email || '-';
  };

  const getUserInitials = () => {
    const source = currentUser?.name || currentUser?.email || '-';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '-';
  };

  const getUserRole = () => {
    if (userRole === 'admin') return 'Administrator';
    if (userRole === 'lecturer') return 'Dosen';
    if (userRole === 'assistant') return 'Asisten Lab';
    return 'Mahasiswa';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">StudiKu</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {userRole === 'admin' ? (
                <>
                  {/* Dashboard */}
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>

                  {/* Manajemen Pengguna - Expandable */}
                  <div>
                    <button
                      onClick={() => setUserMenuExpanded(!userMenuExpanded)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        activeTab.startsWith('users-')
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <span>Manajemen Pengguna</span>
                      </div>
                      {userMenuExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Sub Menu */}
                    {userMenuExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {adminUserSubMenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                              activeTab === subItem.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <subItem.icon className="w-4 h-4" />
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other Admin Menu Items (excluding Dashboard) */}
                  {adminMenuItems.filter(item => item.id !== 'dashboard').map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {/* Student Menu Items */}
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="px-4 text-xs text-gray-400 mb-2">PENGATURAN</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Pengaturan</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex-1 lg:flex-none">
                <h2 className="text-gray-900 lg:hidden">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative text-gray-500 hover:text-gray-700">
                  <Bell className="w-6 h-6" />
                </button>
                
                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-gray-900 text-sm">{getUserName()}</p>
                    <p className="text-xs text-gray-500">{getUserRole()}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-white text-sm">{getUserInitials()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {userRole === 'admin' ? (
            <>
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'courses' && <CourseManagement />}
              {activeTab === 'academic-year' && <AcademicYearManagement />}
              {activeTab === 'class-data' && <ClassData />}
              {activeTab === 'reports' && <AdminReports />}
              {activeTab === 'users-students' && <StudentManagement />}
              {activeTab === 'users-lecturers' && <LecturerManagement />}
              {activeTab === 'users-assistants' && <LabAssistantManagement />}
            </>
          ) : userRole === 'lecturer' ? (
            <>
              {activeTab === 'dashboard' && <LecturerDashboard userName={currentUser?.name} />}
              {activeTab === 'courses' && <LecturerCourses />}
              {activeTab === 'attendance' && <LecturerAttendance />}
              {activeTab === 'grades' && <LecturerGrades />}
              {activeTab === 'reports' && <LecturerReports />}
            </>
          ) : userRole === 'assistant' ? (
            <>
              {activeTab === 'dashboard' && <AssistantDashboard userName={currentUser?.name} />}
              {activeTab === 'practicals' && <AssistantPracticals />}
              {activeTab === 'attendance' && <AssistantAttendance />}
              {activeTab === 'reports' && <AssistantReports />}
            </>
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} onCourseSelect={handleCourseSelect} />}
              {activeTab === 'courses' && <Courses selectedCourseId={selectedCourseId} onClearSelection={() => setSelectedCourseId(null)} />}
              {activeTab === 'assignments' && <Assignments />}
              {activeTab === 'grades' && <Grades />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
