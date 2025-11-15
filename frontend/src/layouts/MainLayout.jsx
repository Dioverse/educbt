import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User,
  LayoutDashboard,
  BookOpen,
  FileText,
  GraduationCap,
  ClipboardCheck,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Role-based menu items
  const getMenuItems = () => {
    const menuItems = [];

    if (user?.role === 'admin') {
      menuItems.push(
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Questions', path: '/questions', icon: BookOpen },
        { name: 'Exams', path: '/exams', icon: FileText },
        // { name: 'Grading', path: '/grading/dashboard', icon: ClipboardCheck },
      );
    } else if (user?.role === 'supervisor') {
      menuItems.push(
        { name: 'Dashboard', path: '/grading/dashboard', icon: LayoutDashboard },
        { name: 'Questions', path: '/questions', icon: BookOpen },
        { name: 'Exams', path: '/exams', icon: FileText },
        { name: 'Grading', path: '/grading/dashboard', icon: ClipboardCheck },
        { name: 'Rubrics', path: '/grading/rubrics', icon: Settings },
      );
    } else if (user?.role === 'student') {
      menuItems.push(
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Exams', path: '/student/dashboard', icon: FileText },
      );
    }

    return menuItems;
  };

  const menuItems = getMenuItems();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center gap-2 ml-2 md:ml-0">
                <GraduationCap size={32} className="text-teal-600" />
                <span className="text-xl font-bold text-gray-900">CBT System</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-teal-50 text-teal-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="text-teal-600" size={20} />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-teal-50 text-teal-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}