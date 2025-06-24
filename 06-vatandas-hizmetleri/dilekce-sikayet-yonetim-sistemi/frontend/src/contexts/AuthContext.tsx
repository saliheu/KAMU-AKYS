import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Citizen, Officer, LoginFormData, RegisterFormData } from '../types';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  citizen: Citizen | null;
  officer: Officer | null;
  loading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isCitizen: boolean;
  isOfficer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          const currentCitizen = authService.getCurrentCitizen();
          const currentOfficer = authService.getCurrentOfficer();
          
          if (currentUser) {
            // Verify token is still valid
            const verifiedUser = await authService.verifyToken();
            setUser(verifiedUser);
            setCitizen(currentCitizen);
            setOfficer(currentOfficer);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginFormData) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setCitizen(response.citizen || null);
      setOfficer(response.officer || null);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setCitizen(response.citizen || null);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCitizen(null);
    setOfficer(null);
  };

  const value: AuthContextType = {
    user,
    citizen,
    officer,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isCitizen: user?.role === 'CITIZEN',
    isOfficer: user?.role === 'OFFICER',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};