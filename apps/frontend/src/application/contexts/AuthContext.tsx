import React, { createContext, useContext, useState } from 'react';
import { UserDTO, Permission, hasPermission } from '@yapia/shared';

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  login: (noHp: string, password: string) => Promise<{ success: boolean; user?: UserDTO; message?: string }>;
  loginPendaftar: (noHp: string, email: string) => Promise<{ success: boolean; user?: UserDTO; message?: string }>;
  loginAsDemo: (role: 'ADMIN' | 'OPERATOR' | 'KEPSEK' | 'BENDAHARA' | 'PENDAFTAR') => UserDTO;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<'ADMIN' | 'OPERATOR' | 'KEPSEK' | 'BENDAHARA' | 'PENDAFTAR', UserDTO> = {
  ADMIN: {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    namaLengkap: 'Administrator SPMB',
    noHp: '081200000001',
    email: 'admin@yapia.sch.id',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  OPERATOR: {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    namaLengkap: 'Ruslan Setiawan (Operator Dapodik)',
    noHp: '081200000002',
    email: 'ruslan@yapia.sch.id',
    role: 'OPERATOR',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  KEPSEK: {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    namaLengkap: 'Via Aprilian Safitri Nur, S.Kom (Kepala Sekolah)',
    noHp: '081200000004',
    email: 'kepsek@yapia.sch.id',
    role: 'KEPSEK',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  BENDAHARA: {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    namaLengkap: 'Bendahara PPDB SMP YAPIA',
    noHp: '081200000005',
    email: 'bendahara@yapia.sch.id',
    role: 'BENDAHARA',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  PENDAFTAR: {
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    namaLengkap: 'Bpk. Hendra (Orang Tua Alka Alhabsy)',
    noHp: '081299887766',
    email: 'pendaftar@yapia.sch.id',
    role: 'PENDAFTAR',
    isActive: true,
    createdAt: '2026-10-15T00:00:00Z',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const loginAsDemo = (role: 'ADMIN' | 'OPERATOR' | 'KEPSEK' | 'BENDAHARA' | 'PENDAFTAR'): UserDTO => {
    const selected = DEMO_ACCOUNTS[role];
    setUser(selected);
    setToken(`demo-token-${role}`);
    localStorage.setItem('yapia_auth_user', JSON.stringify(selected));
    localStorage.setItem('yapia_auth_token', `demo-token-${role}`);
    return selected;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('yapia_auth_user');
    localStorage.removeItem('yapia_auth_token');
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
        loginAsDemo,
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
