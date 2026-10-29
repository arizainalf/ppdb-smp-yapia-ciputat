import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  Shield,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Building,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../application/contexts/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { InputField } from '../components/common/InputField.js';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onBackToHome: () => void;
  onNavigateRegister: () => void;
  onLoginSuccess: (targetView: 'admin' | 'status') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToHome,
  onNavigateRegister,
  onLoginSuccess,
}) => {
  const { login, loginPendaftar, isAuthenticated, user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTarget = searchParams.get('redirect');

  const handleSuccessRedirect = (defaultTarget: 'admin' | 'status') => {
    if (redirectTarget) {
      navigate(redirectTarget);
    } else {
      onLoginSuccess(defaultTarget);
    }
  };

  const [loginType, setLoginType] = useState<'pendaftar' | 'panitia'>('pendaftar');

  // Fields for Pendaftar (WhatsApp + Email only, tanpa password)
  const [noHpPendaftar, setNoHpPendaftar] = useState('');
  const [emailPendaftar, setEmailPendaftar] = useState('');

  // Fields for Panitia (Akun + Password)
  const [noHpPanitia, setNoHpPanitia] = useState('');
  const [passwordPanitia, setPasswordPanitia] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      handleSuccessRedirect('status');
    } else {
      setErrorMsg(res.message || 'Login orang tua gagal. Pastikan nomor WhatsApp dan email cocok dengan data pendaftaran.');
    }
  };

  const handleSubmitPanitia = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!noHpPanitia.trim() || !passwordPanitia.trim()) {
      setErrorMsg('Nomor WhatsApp / Akun dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    const res = await login(noHpPanitia, passwordPanitia);
    setIsLoading(false);

    if (res.success) {
      handleSuccessRedirect('admin');
    } else {
      setErrorMsg(res.message || 'Login panitia gagal. Silakan periksa kembali akun atau kata sandi Anda.');
    }
  };

  const handleDemoSelect = async (role: 'KEPSEK' | 'OPERATOR' | 'BENDAHARA' | 'ADMIN' | 'PENDAFTAR') => {
    setIsLoading(true);
    setErrorMsg(null);
    if (role === 'PENDAFTAR') {
      const res = await loginPendaftar('081299887766', 'pendaftar@yapia.sch.id');
      setIsLoading(false);
      if (res.success) {
        handleSuccessRedirect('status');
      } else {
        setErrorMsg(res.message || 'Login orang tua gagal.');
      }
    } else {
      const phoneMap = {
        ADMIN: '081200000001',
        OPERATOR: '081200000002',
        KEPSEK: '081200000004',
        BENDAHARA: '081200000005',
      };
      const res = await login(phoneMap[role], 'password123');
      setIsLoading(false);
      if (res.success) {
        handleSuccessRedirect('admin');
      } else {
        setErrorMsg(res.message || 'Login panitia gagal.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30 py-8 sm:py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda SPMB</span>
          </button>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            Tahun Ajaran 2026/2027
          </span>
        </div>

        {/* Existing Active Session Alert (if already logged in) */}
        {isAuthenticated && user && (
          <div className="p-4 rounded-2xl bg-emerald-800 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  Anda Sedang Masuk sebagai: <span className="text-emerald-200">{user.namaLengkap}</span> ({user.role})
                </h4>
                <p className="text-xs text-emerald-100">
                  {user.role === 'PENDAFTAR'
                    ? 'Anda dapat langsung memeriksa status pendaftaran dan SK kelulusan ananda.'
                    : 'Anda memiliki akses ke portal dasbor administrasi panitia SPMB.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleSuccessRedirect(user.role === 'PENDAFTAR' ? 'status' : 'admin')}
                className="flex-1 sm:flex-none text-xs py-2 px-4 bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-xs cursor-pointer"
              >
                {user.role === 'PENDAFTAR' ? 'Buka Status Ananda' : 'Buka Dasbor Panitia'}
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="text-xs py-2 px-3 border-emerald-500 text-emerald-100 hover:bg-emerald-700 hover:text-white cursor-pointer"
              >
                Ganti Akun
              </Button>
            </div>
          </div>
        )}

        {/* Main Grid: Left Side Branding + Right Side Auth Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: School PPDB Introduction (Visible on LG) */}
          <div className="lg:col-span-5 space-y-6 lg:pt-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
                <img
                  src="/assets/logo-smp-yapia-ciputat.png"
                  alt="Logo SMP YAPIA Ciputat"
                  className="w-4 h-4 object-contain"
                />
                <span>Portal Masuk Resmi PPDB</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Selamat Datang di Portal Penerimaan Murid Baru SMP YAPIA
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sistem informasi terintegrasi untuk orang tua calon murid dan panitia seleksi admisi SMP YAPIA Ciputat.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Akses Tanpa Ribet untuk Orang Tua</strong>
                  <span className="text-slate-500">
                    Cukup menggunakan WhatsApp dan Email yang didaftarkan. Tanpa perlu menghafal kata sandi rumit.
                  </span>
                </div>
              </div>

              {/* <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Keamanan & Kepatuhan UU PDP No. 27/2022</strong>
                  <span className="text-slate-500">
                    Data siswa dan wali murid dilindungi dengan sistem otentikasi ketat dan verifikasi berkas resmi TU.
                  </span>
                </div>
              </div> */}

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">Layanan Helpdesk Offline</strong>
                  <span className="text-slate-500">
                    Staf TU melayani penyerahan fisik di Jl. KH. Dewantara No. 12, Ciputat (Senin-Jumat 08.00-15.00).
                  </span>
                </div>
              </div>
            </div>

            {/* Registration CTA for Unregistered Visitors */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Calon Pendaftar Baru
              </span>
              <h4 className="text-sm font-bold">Belum Mengisi Formulir Pendaftaran?</h4>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Pendaftaran siswa baru dibuka untuk Jalur Reguler dan Jalur Afirmasi (KIP/SKTM).
              </p>
              <Button
                onClick={onNavigateRegister}
                className="w-full text-xs py-2 bg-white text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 font-bold shadow-xs cursor-pointer mt-1"
              >
                Mulai Pendaftaran Online Sekarang →
              </Button>
            </div>
          </div>

          {/* Right Side: Main Authentication Form Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Top Form Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center p-1.5 shadow-md shadow-emerald-950/40 shrink-0">
                  <img
                    src="/assets/logo-smp-yapia-ciputat.png"
                    alt="Logo SMP YAPIA Ciputat"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">
                    Masuk ke Sistem SPMB
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pilih akses sesuai peran Anda di SMP YAPIA Ciputat
                  </p>
                </div>
              </div>
            </div>

            {/* Segmented Tab Switcher: Orang Tua vs Panitia */}
            <div className="p-4 sm:p-6 pb-2">
              <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('pendaftar');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loginType === 'pendaftar'
                      ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {/* <span className="text-base">👨‍👩‍👦</span> */}
                  <span>Orang Tua / Pendaftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('panitia');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    loginType === 'panitia'
                      ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200/80 font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {/* <span className="text-base">💼</span> */}
                  <span>Panitia PPDB</span>
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="block font-bold">Terjadi Kesalahan:</strong>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* TAB 1: FORM ORANG TUA / PENDAFTAR (NO PASSWORD) */}
              {loginType === 'pendaftar' && (
                <form onSubmit={handleSubmitPendaftar} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3 leading-relaxed">
                    <UserCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-emerald-900 block">
                        Akses Instan Tanpa Password:
                      </strong>
                      <span>
                        Cukup masukkan <strong>Nomor WhatsApp</strong> dan <strong>Email</strong> yang dicantumkan saat pendaftaran. Sistem akan mencocokkan berkas ananda secara otomatis.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <InputField
                      label="Nomor WhatsApp Orang Tua / Wali"
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
                      placeholder="Contoh: pendaftar@yapia.sch.id atau email Anda"
                    />

                    <span className="text-[11px] text-slate-500 block">
                      💡 <strong>Catatan:</strong> Masukkan nomor WhatsApp dan Email yang sesuai dengan data saat mendaftar. Atau gunakan tombol <em>Akses Cepat Pengujian (1-Klik Demo)</em> di bawah.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-800/20 rounded-xl cursor-pointer mt-2"
                  >
                    <UserCheck className="w-4 h-4" /> Masuk ke Status Pendaftaran Ananda
                  </Button>
                </form>
              )}

              {/* TAB 2: FORM PANITIA PPDB (PASSWORD REQUIRED) */}
              {loginType === 'panitia' && (
                <form onSubmit={handleSubmitPanitia} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3 leading-relaxed">
                    <Shield className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-slate-900 block">
                        Portal Internal Panitia & Pimpinan Sekolah:
                      </strong>
                      <span>
                        Akses khusus untuk verifikator Tata Usaha, Operator Dapodik, Bendahara, dan Kepala Sekolah.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <InputField
                      label="Nomor WhatsApp / ID Panitia"
                      name="noHpPanitia"
                      type="text"
                      required
                      value={noHpPanitia}
                      onChange={(e) => setNoHpPanitia(e.target.value)}
                      placeholder="Contoh: 081200000002"
                    />

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
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Password demo default: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">password123</code>
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md rounded-xl cursor-pointer mt-2"
                  >
                    <Lock className="w-4 h-4" /> Masuk ke Dasbor Panitia
                  </Button>
                </form>
              )}

              {/* Quick 1-Click Demo Section (For Evaluation / Testing) */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Akses Cepat Pengujian (1-Klik Demo)
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    Siap Pakai
                  </span>
                </div>

                {/* Demo Orang Tua */}
                <button
                  type="button"
                  onClick={() => handleDemoSelect('PENDAFTAR')}
                  className="w-full p-3 rounded-2xl border border-teal-300 bg-teal-50/70 hover:bg-teal-100 text-teal-950 font-semibold text-left transition-all flex items-center gap-3 shadow-2xs cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 text-base shadow-xs group-hover:scale-105 transition-transform">
                    👨‍👩‍👦
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-teal-950">
                        Demo Orang Tua (Alka Alhabsy)
                      </span>
                      <span className="text-[10px] font-black text-teal-800 bg-teal-200/70 px-2 py-0.5 rounded-full">
                        Pendaftar
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-700 truncate block mt-0.5">
                      WA: 081299887766 • Email: pendaftar@yapia.sch.id
                    </span>
                  </div>
                </button>

                {/* Demo Panitia Buttons */}
                <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => handleDemoSelect('KEPSEK')}
                    className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs">
                      🎓
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold block text-xs truncate">Kepala Sekolah</span>
                      <span className="text-[10px] text-indigo-600 block truncate">Via Aprilian</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSelect('OPERATOR')}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs">
                      💻
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold block text-xs truncate">Operator Dapodik</span>
                      <span className="text-[10px] text-blue-600 block truncate">Ruslan Setiawan</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSelect('BENDAHARA')}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 text-xs">
                      💵
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold block text-xs truncate">Bendahara PPDB</span>
                      <span className="text-[10px] text-amber-700 block truncate">Verifikasi Infak</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSelect('ADMIN')}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 font-semibold text-left transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs">
                      👑
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-bold block text-xs truncate">Super Admin</span>
                      <span className="text-[10px] text-emerald-700 block truncate">Akses Penuh</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
