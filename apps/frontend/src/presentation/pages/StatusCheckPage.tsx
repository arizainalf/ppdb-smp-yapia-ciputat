import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Printer,
  FileText,
  Award,
  BookOpen,
  ShieldCheck,
  Upload,
  Clock,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { printElement } from '../utils/print.js';
import { InputField } from '../components/common/InputField.js';
import { useAuth } from '../../application/contexts/AuthContext.js';

interface StatusCheckPageProps {
  onBackToHome: () => void;
  onNewRegistration: () => void;
  onOpenLogin?: () => void;
}

interface RegistrationStatusData {
  nomorPendaftaran: string;
  namaLengkap: string;
  nisn: string;
  sekolahAsal: string;
  gelombang: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'LOLOS_SELEKSI' | 'REVISI' | 'MENGIKUTI_MPLS' | 'DITERIMA_RESMI';
  jalur: string;
  tanggalDaftar: string;
  verifikasiFisik: boolean;
  observasiQuran?: string;
  rombel?: string;
  catatanPanitia: string;
}

export const StatusCheckPage: React.FC<StatusCheckPageProps> = ({
  onBackToHome,
  onNewRegistration,
  onOpenLogin,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const isParentLoggedIn = isAuthenticated && user?.role === 'PENDAFTAR';

  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSKModal, setShowSKModal] = useState(false);
  const [showRevisiUploadSuccess, setShowRevisiUploadSuccess] = useState(false);
  const [result, setResult] = useState<RegistrationStatusData | null>(null);

  const searchStudent = async (term: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/calon-siswa/${encodeURIComponent(term)}`);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setResult(json.data);
      } else {
        setResult(null);
      }
    } catch (err) {
      console.error('Gagal mengambil status pendaftaran:', err);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Jika Orang Tua sudah login, langsung tampilkan data pendaftar miliknya
  useEffect(() => {
    if (isParentLoggedIn && user) {
      const searchTerm = user.noHp || user.email;
      if (searchTerm) searchStudent(searchTerm);
    }
  }, [isParentLoggedIn, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    searchStudent(cleanQuery);
  };

  const getStatusBadge = (status: RegistrationStatusData['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return { label: 'Form Online Terkirim', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'VERIFIED':
        return { label: 'Berkas Fisik Terverifikasi TU', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'LOLOS_SELEKSI':
        return { label: 'Lolos Seleksi & Observasi', color: 'bg-emerald-500 text-slate-950 font-black' };
      case 'MENGIKUTI_MPLS':
        return { label: 'Peserta MPLS', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'DITERIMA_RESMI':
        return { label: 'Diterima Resmi (Siswa Aktif)', color: 'bg-emerald-600 text-white font-black' };
      case 'REVISI':
        return { label: 'Perlu Revisi Dokumen', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const currentStepIndex = (status: RegistrationStatusData['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return 1;
      case 'REVISI':
        return 1;
      case 'VERIFIED':
        return 2;
      case 'LOLOS_SELEKSI':
        return 3;
      case 'MENGIKUTI_MPLS':
        return 4;
      case 'DITERIMA_RESMI':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 space-y-6 font-sans">
      {/* Top Breadcrumb Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>

        {isParentLoggedIn && (
          <button
            onClick={logout}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar dari Akun Orang Tua
          </button>
        )}
      </div>

      {/* Header Banner for Logged-In Parents */}
      {isParentLoggedIn ? (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-emerald-700 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wider">
              Portal Pendaftar / Orang Tua
            </span>
            <span className="text-xs text-emerald-200">
              SMP YAPIA Ciputat • T.A 2026/2027
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Status & Progres Pendaftaran Calon Siswa
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Selamat datang, <strong>{user?.namaLengkap}</strong>. Berikut adalah rekapitulasi data verifikasi berkas, hasil observasi BTQ, dan Surat Keputusan (SK) Kelulusan ananda.
          </p>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Pelacakan Terpadu SPMB
          </span>
          <h1 className="text-xl sm:text-xl font-black text-slate-600 tracking-tight">
            Cek Status Pendaftaran & SK Kelulusan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Masukkan <strong>Nomor Registrasi</strong> (format: <code>REG-2026-GX-XXXX</code>) atau <strong>NISN 10 digit</strong> untuk memeriksa verifikasi berkas dan mengunduh SK Resmi.
          </p>
        </div>
      )}

      {/* Notification banner to login if parent is viewing anonymously */}
      {!isParentLoggedIn && onOpenLogin && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-emerald-950 block">
                Sudah Mendaftar dan Memiliki Akun Orang Tua?
              </span>
              <span className="text-emerald-700 text-[11px]">
                Masuk menggunakan <strong>Nomor WhatsApp dan Email</strong> yang didaftarkan (tanpa password) untuk melihat riwayat berkas, jadwal tes observasi BTQ, dan mengunduh SK resmi.
              </span>
            </div>
          </div>
          <Button
            onClick={onOpenLogin}
            className="w-full sm:w-auto text-xs py-2 px-4 bg-emerald-700 hover:bg-emerald-800 shrink-0 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" /> Masuk via WA & Email
          </Button>
        </div>
      )}

      {/* Search Bar Form (only shown if not logged in or parent wants to check another registration) */}
      {!isParentLoggedIn && (
        <form
          onSubmit={handleSearch}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <InputField
              label="Nomor Registrasi / NISN / No. WA / Email"
              name="query"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh format: REG-2026-G1-0001, 0123456789, atau 0812XXXXXXX"
            />
          </div>
          <div className="sm:self-end">
            <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto py-2.5">
              <Search className="w-4 h-4" /> Cari Data
            </Button>
          </div>
        </form>
      )}

      {/* Result Display */}
      {hasSearched && result && (
        <div id="status-print-area" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Card Top Title Bar */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Data Calon Siswa Terkonfirmasi
                </span>
                {result.rombel && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {result.rombel}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">{result.namaLengkap}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {result.nomorPendaftaran} • Jalur {result.jalur}
              </p>
            </div>
            <div className="self-start sm:self-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(result.status).color}`}>
                {result.status === 'REVISI' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {getStatusBadge(result.status).label}
              </span>
            </div>
          </div>

          {/* Stepper Status Berjenjang (Sesuai Hasil Audit Wawancara Kepsek & Panitia TU) */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
              <span>Alur Tahapan Admisi & Penetapan Siswa Baru</span>
              <span className="text-[10px] font-semibold text-slate-400">
                Langkah {currentStepIndex(result.status)} dari 5
              </span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-center text-xs [&>*:last-child]:col-span-2 [&>*:last-child]:sm:col-span-1">
              {/* Step 1: Form Terkirim */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ✓
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">1. Form Online</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Terkirim</span>
              </div>

              {/* Step 2: Verifikasi Berkas Fisik TU */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  result.status === 'REVISI'
                    ? 'bg-rose-500 text-white'
                    : result.verifikasiFisik
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white ring-4 ring-amber-100'
                }`}>
                  {result.status === 'REVISI' ? '!' : result.verifikasiFisik ? '✓' : <Clock className="w-4 h-4" />}
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">2. Verifikasi TU</span>
                <span className={`text-[10px] font-semibold ${
                  result.status === 'REVISI'
                    ? 'text-rose-600'
                    : result.verifikasiFisik
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}>
                  {result.status === 'REVISI' ? 'Perlu Revisi' : result.verifikasiFisik ? 'Fisik Valid' : 'Antre di TU'}
                </span>
              </div>

              {/* Step 3: Lolos Seleksi Observasi */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  ['LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status)
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${
                  ['LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status)
                    ? 'text-blue-900'
                    : 'text-slate-500'
                }`}>
                  3. Seleksi BTQ
                </span>
                <span className={`text-[10px] font-semibold ${
                  ['LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status)
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}>
                  {['LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status) ? 'Lolos SK' : 'Tahap Tes'}
                </span>
              </div>

              {/* Step 4: MPLS */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  ['MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status)
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${
                  ['MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status)
                    ? 'text-purple-900'
                    : 'text-slate-500'
                }`}>
                  4. Ikuti MPLS
                </span>
                <span className={`text-[10px] ${
                  ['MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status) ? 'text-purple-600 font-semibold' : 'text-slate-400'
                }`}>
                  {['MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status) ? 'Terdaftar' : 'Masa Orientasi'}
                </span>
              </div>

              {/* Step 5: Diterima Resmi */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  result.status === 'DITERIMA_RESMI'
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-bold mt-1.5 ${
                  result.status === 'DITERIMA_RESMI' ? 'text-emerald-900' : 'text-slate-500'
                }`}>
                  5. Siswa Resmi
                </span>
                <span className={`text-[10px] ${
                  result.status === 'DITERIMA_RESMI' ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                }`}>
                  {result.status === 'DITERIMA_RESMI' ? 'Siswa Aktif' : 'Tahap Akhir'}
                </span>
              </div>
            </div>
          </div>

          {/* Detail Information */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">NISN Calon Siswa:</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{result.nisn}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Sekolah Asal:</span>
                <span className="font-bold text-slate-800 text-sm">{result.sekolahAsal}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Periode Gelombang:</span>
                <span className="font-bold text-slate-800">{result.gelombang}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jalur Pendaftaran:</span>
                <span className="font-bold text-amber-700">{result.jalur}</span>
              </div>
              {result.observasiQuran && (
                <div>
                  <span className="text-slate-400 block">Hasil Observasi Al-Qur'an (BTQ):</span>
                  <span className="font-bold text-indigo-800">{result.observasiQuran}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block">Verifikasi Fisik Tata Usaha:</span>
                <span className={`font-bold ${result.verifikasiFisik ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {result.verifikasiFisik ? '✓ Dokumen Fisik Sah & Lengkap' : 'Belum Selesai'}
                </span>
              </div>
            </div>

            {/* Official Announcement / Notes */}
            <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
              result.status === 'REVISI'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <span className="font-bold flex items-center gap-1.5">
                {result.status === 'REVISI' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
                Catatan Resmi Panitia PPDB SMP YAPIA:
              </span>
              <p className="leading-relaxed">{result.catatanPanitia}</p>
            </div>

            {/* Upload Revision Action if Status is REVISI */}
            {result.status === 'REVISI' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Unggah Berkas Perbaikan / Revisi</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Silakan unggah pindaian (scan) atau foto dokumen Akta Kelahiran / Kartu Keluarga yang jelas (format PDF/JPG/PNG max 2MB).
                </p>

                {showRevisiUploadSuccess ? (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Berkas revisi berhasil diunggah! Panitia TU akan memverifikasi ulang dalam 1x24 jam kerja.</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="file"
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                    />
                    <Button
                      onClick={() => setShowRevisiUploadSuccess(true)}
                      className="text-xs py-1.5 px-4 bg-amber-600 hover:bg-amber-700"
                    >
                      Kirim Berkas Revisi
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
              {['LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(result.status) && (
                <Button
                  onClick={() => setShowSKModal(true)}
                  className="w-full sm:w-auto text-xs py-2 bg-indigo-700 hover:bg-indigo-800 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" /> Unduh Surat Keputusan (SK) Kelulusan Digital
                </Button>
              )}

              <Button
                onClick={() => printElement(document.getElementById('status-print-area'))}
                variant="outline"
                className="w-full sm:w-auto text-xs py-2 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Lembar Status Pendaftaran
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* If Search yielded no result */}
      {hasSearched && !result && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800">Nomor Registrasi Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Silakan periksa kembali nomor registrasi yang tertera pada lembar formulir Anda atau hubungi panitia SPMB.
          </p>
          <Button onClick={onNewRegistration} className="mx-auto mt-4 px-6 py-2.5 text-xs">
            Daftar Calon Siswa Baru
          </Button>
        </div>
      )}

      {/* Modal Cetak Surat Keputusan Resmi (SK) Kelulusan */}
      {showSKModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div id="sk-print-area" className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-8 space-y-4 border border-slate-200 text-slate-900 font-sans">
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-800">
                YAYASAN PENDIDIKAN ISLAM DAN SOSIAL CIPUTAT
              </h4>
              <h3 className="text-base font-black text-emerald-800">
                SMP YAPIA CIPUTAT
              </h3>
              <p className="text-[10px] text-slate-600">
                Jl. Ki Hajar Dewantara No. 12, Ciputat, Tangerang Selatan • Telp: (021) 749-1234
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-xs font-bold uppercase underline">
                SURAT KEPUTUSAN PENETAPAN KELULUSAN SELEKSI SPMB
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                Nomor: {result.nomorPendaftaran}/SK-SPMB/YAPIA/2026
              </p>
            </div>

            <p className="text-xs leading-relaxed">
              Berdasarkan hasil verifikasi dokumen persyaratan fisik dan tes seleksi observasi Al-Qur'an SPMB Tahun Pelajaran 2026/2027, Kepala SMP YAPIA Ciputat menetapkan bahwa:
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div><strong>Nama Siswa:</strong> {result.namaLengkap}</div>
              <div><strong>NISN:</strong> {result.nisn}</div>
              <div><strong>Sekolah Asal:</strong> {result.sekolahAsal}</div>
              <div><strong>Jalur Pendaftaran:</strong> {result.jalur}</div>
              {result.rombel && (
                <div><strong>Penempatan Rombel:</strong> {result.rombel}</div>
              )}
              <div>
                <strong>Status Penetapan:</strong>{' '}
                <span className="font-bold text-emerald-700">LOLOS SELEKSI RESMI DITERIMA</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              Siswa diwajibkan mengikuti tahapan <strong>Masa Pengenalan Lingkungan Sekolah (MPLS)</strong> sesuai jadwal sekolah. Keabsahan dokumen ini dapat diverifikasi melalui QR Code digital resmi di bawah ini.
            </p>

            <div className="pt-4 flex justify-between items-end border-t border-slate-100">
              <div className="text-center text-[10px] text-slate-500">
                <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center font-mono text-[9px] text-slate-500">
                  [QR VALID]
                </div>
                Scan Verifikasi
              </div>
              <div className="text-right text-xs">
                <div>Tangerang Selatan, 16 Oktober 2026</div>
                <div className="text-[11px] font-bold mt-1">Kepala Sekolah SMP YAPIA,</div>
                <div className="mt-8 font-bold underline">Via Aprilian Safitri Nur, S.Kom</div>
                <div className="text-[10px] text-slate-500">NIP. 19880412 201201 2 001</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 no-print">
              <Button variant="outline" onClick={() => setShowSKModal(false)} className="text-xs py-1.5 cursor-pointer">
                Tutup
              </Button>
              <Button onClick={() => printElement(document.getElementById('sk-print-area'))} className="text-xs py-1.5 bg-indigo-700 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Cetak Dokumen SK Resmi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
