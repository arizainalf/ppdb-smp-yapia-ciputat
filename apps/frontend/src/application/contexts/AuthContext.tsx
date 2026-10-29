import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDTO, Permission, hasPermission } from '@yapia/shared';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  login: (noHp: string, password: string) => Promise<{ success: boolean; user?: UserDTO; message?: string }>;
  loginPendaftar: (noHp: string, email: string) => Promise<{ success: boolean; user?: UserDTO; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDTO | null>(() => {
    const saved = localStorage.getItem('yapia_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('yapia_auth_token');
  });

  const isAuthenticated = !!user;

  const login = async (noHp: string, password: string): Promise<{ success: boolean; user?: UserDTO; message?: string }> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noHp, password }),
      });

      const data = await res.json();
      if (res.ok && data.data?.user) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('yapia_auth_user', JSON.stringify(data.data.user));
        localStorage.setItem('yapia_auth_token', data.data.token);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, message: data.message || 'Login gagal.' };
      }
    } catch {
      return { success: false, message: 'Koneksi ke backend gagal. Pastikan server backend aktif.' };
    }
  };

  const loginPendaftar = async (noHp: string, email: string): Promise<{ success: boolean; user?: UserDTO; message?: string }> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/auth/login-pendaftar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noHp, email }),
      });

      const data = await res.json();
      if (res.ok && data.data?.user) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('yapia_auth_user', JSON.stringify(data.data.user));
        localStorage.setItem('yapia_auth_token', data.data.token);
        return { success: true, user: data.data.user };
      } else {
        return { success: false, message: data.message || 'Login orang tua gagal.' };
      }
    } catch {
      return { success: false, message: 'Koneksi ke backend gagal. Pastikan server backend aktif.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('yapia_auth_user');
    localStorage.removeItem('yapia_auth_token');
    navigate('/login', { replace: true });
  };

  const can = (permission: Permission) => {
    return hasPermission(user?.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        can,
        login,
        loginPendaftar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
