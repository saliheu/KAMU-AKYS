import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};