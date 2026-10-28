import React, { useState } from 'react';
import {
  Phone,
  CheckCircle,
  Home,
  UserPlus,
  Shield,
  LogIn,
  LogOut,
  Menu,
  X,
  ExternalLink,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminClick = () => {
    setMobileMenuOpen(false);
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

  const handleMobileNav = (view: 'landing' | 'register' | 'status' | 'admin' | 'login') => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & School Name */}
        <div
          onClick={() => handleMobileNav('landing')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-w-0"
        >
          <img
            src="/assets/logo-smp-yapia-ciputat.png"
            alt="Logo SMP YAPIA Ciputat"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base md:text-lg truncate">
                SMP YAPIA CIPUTAT
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                PPDB 2026/2027
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              Sistem Informasi Penerimaan Murid Baru
            </p>
          </div>
        </div>

        {/* Desktop Navigation (md and above) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'landing'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => onNavigate('status')}
            className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              currentView === 'register'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Sekarang</span>
          </button>

          {/* Portal Panitia / Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAdminClick}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                    <span className="font-bold">Portal Pendaftar</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">
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
              className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'login'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200'
              }`}
              title="Masuk ke Portal PPDB (Orang Tua & Panitia)"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Masuk / Login</span>
            </button>
          )}

          <a
            href="https://wa.me/6281234567890?text=Halo%20Panitia%20PPDB%20SMP%20YAPIA%20Ciputat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
            title="Hubungi Panitia via WhatsApp"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Mobile Action Buttons (md:hidden) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Quick Register Button on Mobile */}
          <button
            onClick={() => onNavigate('register')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
              currentView === 'register'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-600 text-white active:bg-emerald-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Buka Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => handleMobileNav('landing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'landing'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Beranda PPDB</span>
            </button>

            <button
              onClick={() => handleMobileNav('status')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentView === 'status'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cek Status Pendaftaran & SK</span>
            </button>

            <button
              onClick={() => handleMobileNav('register')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                currentView === 'register'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Mulai Pendaftaran Siswa Baru</span>
            </button>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {isAuthenticated ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {user?.namaLengkap}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                        {user?.role === 'PENDAFTAR' ? 'Orang Tua / Pendaftar' : `Panitia (${user?.role})`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Keluar
                    </button>
                  </div>

                  <button
                    onClick={handleAdminClick}
                    className="w-full py-2 px-3 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                  >
                    {user?.role === 'PENDAFTAR' ? 'Buka Status Ananda →' : 'Buka Dasbor Panitia PPDB →'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdminClick}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Masuk Portal (Orang Tua & Panitia)</span>
                </button>
              )}

              <a
                href="https://wa.me/6281234567890?text=Halo%20Panitia%20PPDB%20SMP%20YAPIA%20Ciputat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi Panitia via WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
