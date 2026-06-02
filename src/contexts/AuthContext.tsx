import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../lib/api';

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
  role?: {
    name: UserRole;
    level: number;
  };
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({ id: parsedUser.id, email: parsedUser.email });
        setProfile(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;

      // Save token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser({ id: userData.id, email: userData.email });
      setProfile(userData);
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await authAPI.changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, changePassword }}>
      {children}
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
