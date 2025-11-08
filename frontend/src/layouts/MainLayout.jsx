import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FileQuestion, ClipboardList, BarChart3, Settings } from 'lucide-react';

export default function MainLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Questions', href: '/questions', icon: FileQuestion },
    { name: 'Exams', href: '/exams', icon: ClipboardList, disabled: true },
    { name: 'Results', href: '/results', icon: BarChart3, disabled: true },
    { name: 'Settings', href: '/settings', icon: Settings, disabled: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CBT System</h1>
            </Link>
            
            <nav className="flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href) && item.href !== '/';
                const isHome = item.href === '/' && location.pathname === '/';
                
                return (
                  <Link
                    key={item.name}
                    to={item.disabled ? '#' : item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive || isHome
                        ? 'bg-blue-50 text-blue-700'
                        : item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={(e) => item.disabled && e.preventDefault()}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 CBT System - Phase 1: Question Bank Complete ✅
          </p>
        </div>
      </footer>
    </div>
  );
}