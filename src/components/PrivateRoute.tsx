import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Validating session...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated → redirect to /login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If forced password change flow is active → redirect to /change-password
  if (profile?.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // If requiredRoles is set and user.role is not in it → redirect to /unauthorized
  if (requiredRoles && profile?.role?.name && !requiredRoles.includes(profile.role.name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
