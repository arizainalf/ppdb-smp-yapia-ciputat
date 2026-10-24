import React, { useState } from 'react';
import {
  X,
  Lock,
  AlertCircle,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../application/contexts/AuthContext.js';
import { Button } from '../common/Button.js';
import { UserDTO } from '@yapia/shared';
import { InputField } from '../common/InputField.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: UserDTO) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, loginPendaftar, loginAsDemo } = useAuth();
  const [loginType, setLoginType] = useState<'pendaftar' | 'panitia'>('pendaftar');

  // Fields for Pendaftar (WA + Email only)
  const [noHpPendaftar, setNoHpPendaftar] = useState('081299887766');
  const [emailPendaftar, setEmailPendaftar] = useState('pendaftar@yapia.sch.id');

  // Fields for Panitia (Akun + Password)
  const [noHpPanitia, setNoHpPanitia] = useState('');
  const [passwordPanitia, setPasswordPanitia] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitPendaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!noHpPendaftar.trim() || !emailPendaftar.trim()) {
      setErrorMsg('Nomor WhatsApp dan Email orang tua wajib diisi.');
      return;
    }

    setIsLoading(true);
    const res = await loginPendaftar(noHpPendaftar, emailPendaftar);
    setIsLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message || 'Login orang tua gagal.');
    }
  };

  const handleSubmitPanitia = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!noHpPanitia.trim() || !passwordPanitia.trim()) {
      setErrorMsg('Nomor WhatsApp / Akun dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    const res = await login(noHpPanitia, passwordPanitia);
    setIsLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.message || 'Login panitia gagal.');
    }
  };

  const handleDemoSelect = (role: 'KEPSEK' | 'OPERATOR' | 'BENDAHARA' | 'ADMIN' | 'PENDAFTAR') => {
    const u = loginAsDemo(role);
    if (onSuccess) onSuccess(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col font-sans">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1 backdrop-blur-xs">
              <img
                src="/assets/logo-smp-yapia-ciputat.png"
                alt="Logo SMP YAPIA Ciputat"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Portal Masuk SPMB</h3>
              <p className="text-xs text-emerald-200">SMP YAPIA Ciputat • Tahun Ajaran 2026/2027</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Orang Tua vs Panitia */}
        <div className="p-4 pb-0">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginType('pendaftar');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginType === 'pendaftar'
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍👩‍👦 Orang Tua / Pendaftar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('panitia');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginType === 'panitia'
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💼 Panitia PPDB</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form 1: ORANG TUA (WhatsApp & Email SAJA - TANPA PASSWORD) */}
          {loginType === 'pendaftar' && (
            <form onSubmit={handleSubmitPendaftar} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2 leading-relaxed">
                <UserCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Akses Mudah Orang Tua:</strong> Cukup masukkan <strong>Nomor WhatsApp</strong> dan <strong>Email</strong> yang Anda gunakan saat mendaftar. Tanpa perlu kata sandi.
                </span>
              </div>

              <InputField
                label="Nomor WhatsApp Orang Tua"
                name="noHpPendaftar"
                type="text"
                required
                value={noHpPendaftar}
                onChange={(e) => setNoHpPendaftar(e.target.value)}
                placeholder="Contoh: 081299887766"
              />

              <InputField
                label="Email Terdaftar Orang Tua"
                name="emailPendaftar"
                type="email"
                required
                value={emailPendaftar}
                onChange={(e) => setEmailPendaftar(e.target.value)}
                placeholder="Contoh: pendaftar@yapia.sch.id"
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 font-bold shadow-xs cursor-pointer"
              >
                <UserCheck className="w-4 h-4" /> Masuk ke Status Ananda
              </Button>
            </form>
          )}

          {/* Form 2: PANITIA PPDB (Akun & Password) */}
          {loginType === 'panitia' && (
            <form onSubmit={handleSubmitPanitia} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2 leading-relaxed">
                <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Portal Internal Panitia:</strong> Untuk Petugas Tata Usaha, Operator Dapodik, Bendahara, dan Kepala Sekolah.
                </span>
              </div>

              <div>
                <InputField
                  label="Nomor WhatsApp / Akun Panitia"
                  name="noHpPanitia"
                  type="text"
                  required
                  value={noHpPanitia}
                  onChange={(e) => setNoHpPanitia(e.target.value)}
                  placeholder="Contoh: 081200000002"
                />
              </div>

              <div>
                <InputField
                  label="Kata Sandi (Password)"
                  name="passwordPanitia"
                  type="password"
                  required
                  value={passwordPanitia}
                  onChange={(e) => setPasswordPanitia(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Password demo default: <code>password123</code>
                </span>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 font-bold shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4" /> Masuk ke Dasbor Panitia
              </Button>
            </form>
          )}

          {/* Quick 1-Click Demo Logins */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Akses Cepat Pengujian Demo (1-Klik)
            </span>

            {/* Orang Tua Demo Button */}
            <button
              type="button"
              onClick={() => handleDemoSelect('PENDAFTAR')}
              className="w-full p-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100/80 text-teal-950 font-semibold text-left transition-colors flex items-center gap-2.5 shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 text-sm">
                👨‍👩‍👦
              </div>
              <div className="overflow-hidden">
                <span className="font-bold block text-xs text-teal-950">
                  Demo Akun Orang Tua (Alka Alhabsy)
                </span>
                <span className="text-[10px] text-teal-700 truncate block">
                  WA: 081299887766 • Email: pendaftar@yapia.sch.id
                </span>
              </div>
            </button>

            {/* Panitia Demo Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => handleDemoSelect('KEPSEK')}
                className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs">
                  🎓
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold block text-[11px] truncate">Kepala Sekolah</span>
                  <span className="text-[9px] text-indigo-600 block truncate">Ibu Via Aprilian</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('OPERATOR')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs">
                  💻
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold block text-[11px] truncate">Operator Dapodik</span>
                  <span className="text-[9px] text-blue-600 block truncate">Ruslan Setiawan</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('BENDAHARA')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 text-xs">
                  💵
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold block text-[11px] truncate">Bendahara PPDB</span>
                  <span className="text-[9px] text-amber-700 block truncate">Verifikasi Infak</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('ADMIN')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                  👑
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold block text-[11px] truncate">Super Admin</span>
                  <span className="text-[9px] text-emerald-700 block truncate">Akses Penuh</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
