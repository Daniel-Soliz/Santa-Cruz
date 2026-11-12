import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserRole } from '../types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  changePassword: (curr: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('nordeste_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nordeste_admin_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('nordeste_admin_token', token);
      localStorage.setItem('nordeste_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nordeste_admin_token');
      localStorage.removeItem('nordeste_admin_user');
    }
  }, [token, user]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.adminLogin(email, pass);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nordeste_admin_token');
    localStorage.removeItem('nordeste_admin_user');
  };

  const changePassword = async (curr: string, newPass: string) => {
    await api.adminChangePassword(curr, newPass);
    if (user) {
      const updated = { ...user, mustChangePassword: false };
      setUser(updated);
      localStorage.setItem('nordeste_admin_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
