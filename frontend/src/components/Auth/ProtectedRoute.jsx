import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardMap = {
      admin: '/admin/dashboard',
      supervisor: '/grading/dashboard',
      student: '/student/dashboard',
    };
    
    return <Navigate to={dashboardMap[user?.role] || '/'} replace />;
  }

  return children;
}