import React from 'react';
import {
  GraduationCap,
  Phone,
  CheckCircle,
  Home,
  UserPlus,
  Shield,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../../application/contexts/AuthContext.js';

interface NavbarProps {
  currentView: 'landing' | 'register' | 'status' | 'admin' | 'login';
  onNavigate: (view: 'landing' | 'register' | 'status' | 'admin' | 'login') => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLogin,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleAdminClick = () => {
    if (isAuthenticated) {
      if (user?.role === 'PENDAFTAR') {
        onNavigate('status');
      } else {
        onNavigate('admin');
      }
    } else {
      if (onOpenLogin) onOpenLogin();
      else onNavigate('login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & School Name */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                SMP YAPIA CIPUTAT
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                PPDB 2026/2027
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Sistem Informasi Penerimaan Murid Baru
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'landing'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </button>

          <button
            onClick={() => onNavigate('status')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'status'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Cek Status</span>
          </button>

          <button
            onClick={() => onNavigate('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              currentView === 'register'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Daftar Sekarang</span>
            <span className="sm:hidden">Daftar</span>
          </button>

          {/* Portal Panitia / Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAdminClick}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  user?.role === 'PENDAFTAR'
                    ? currentView === 'status'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : currentView === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title={`Login sebagai: ${user?.namaLengkap} (${user?.role})`}
              >
                {user?.role === 'PENDAFTAR' ? (
                  <>
                    <span>👨‍👩‍👦</span>
                    <span className="hidden md:inline font-bold">Portal Pendaftar</span>
                    <span className="md:hidden">Ananda</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline font-bold">
                      {user?.role === 'KEPSEK'
                        ? 'Kepsek'
                        : user?.role === 'OPERATOR'
                        ? 'Operator'
                        : user?.role === 'BENDAHARA'
                        ? 'Bendahara'
                        : 'Admin'}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={logout}
                title="Keluar dari akun"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdminClick}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'login'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200'
              }`}
              title="Masuk ke Portal PPDB (Orang Tua & Panitia)"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Masuk / Login</span>
              <span className="md:hidden">Masuk</span>
            </button>
          )}

          <a
            href="https://wa.me/6281234567890?text=Halo%20Panitia%20PPDB%20SMP%20YAPIA%20Ciputat"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
            title="Hubungi Panitia via WhatsApp"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
};
