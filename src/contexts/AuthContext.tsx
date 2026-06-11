import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, fetchCsrfToken } from '../lib/api';

export type UserRole = 'superadmin' | 'admin' | 'technician';

export interface UserProfile {
  id: string;
  role_id?: string;
  name: string;
  email: string;
  mobile_number?: string;
  employee_id: string;
  designation: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  must_change_password?: boolean;
  role?: {
    name: UserRole;
    level: number;
  };
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ requiresPasswordChange: boolean; role?: UserRole }>;
  signOut: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX-03: Restore session from secure httpOnly cookie on initialization
    const checkSession = async () => {
      try {
        // FIX-15: Fetch CSRF token on app init before recovering profile session
        await fetchCsrfToken();
        
        const response = await authAPI.getMe();
        const userData = response.data;
        setUser({ id: userData.id, email: userData.email });
        setProfile(userData);
      } catch (error: any) {
        setUser(null);
        setProfile(null);
        // FIX-31: If 401 and not on public paths, redirect to /login
        if (error.response?.status === 401 && window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      // FIX-03: Do not receive or store token in localStorage; only parse user data and requiresPasswordChange flag (XSS Mitigation)
      const { user: userData, requiresPasswordChange } = response.data;

      setUser({ id: userData.id, email: userData.email });
      setProfile(userData);
      
      return { requiresPasswordChange: !!requiresPasswordChange, role: userData.role?.name };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // FIX-03: Remove local storage session cleanup since cookies are cleared by the backend
      setUser(null);
      setProfile(null);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await authAPI.changePassword(oldPassword, newPassword);
    // After changing password, update our profile must_change_password flag
    if (profile) {
      setProfile({
        ...profile,
        must_change_password: false
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, changePassword }}>
      {loading ? (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm tracking-wider uppercase font-semibold">Loading Workspace...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
