import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from './DashboardPage';
import AssemblyEngineerDashboard from './AssemblyEngineerDashboard';

export default function DashboardEntry() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // No redirect for technicians — they see their own dashboard
  }, [profile, loading, navigate]);

  if (loading) return null;

  // Assembly Engineers / Technicians see their own interactive dashboard
  if (profile?.role?.name === 'technician') {
    return <AssemblyEngineerDashboard />;
  }

  // Admins / Superadmins see the admin dashboard
  return <DashboardPage />;
}
