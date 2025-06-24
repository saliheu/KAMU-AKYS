import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
  personnel?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    photo?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      Cookies.remove('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      Cookies.set('token', token, { expires: 7 });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      toast.success('Giriş başarılı!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Giriş başarısız');
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Çıkış yapıldı');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};