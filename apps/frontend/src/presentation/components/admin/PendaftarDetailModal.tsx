import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  Phone,
  Printer,
  ExternalLink,
  ShieldCheck,
  Award,
  BookOpen,
  History,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';

export interface AdminCalonSiswaItem {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  nisn: string;
  nik?: string;
  noKk?: string;
  sekolahAsal: string;
  npsnAsal?: string;
  kecamatanAsal?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  alamat: string;
  namaOrtu: string;
  noHpOrtu: string;
  gelombangId: number;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'VERIFIED'
    | 'LOLOS_SELEKSI'
    | 'MENGIKUTI_MPLS'
    | 'DITERIMA_RESMI'
    | 'REVISI'
    | 'REJECTED';
  tanggalDaftar: string;

  // Fitur Jalur Afirmasi & KIP / SKTM
  jalurPendaftaran: 'REGULER' | 'AFIRMASI' | 'PRESTASI';
  nomorKipSktm?: string;

  // Kepatuhan UU PDP No. 27/2022
  pdpConsent: boolean;

  // Verifikasi Berkas Fisik TU (Golden Record)
  verifikasiFisik: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  };

  // Asesmen Observasi & Rombel (Waka Kesiswaan & Guru PAI)
  observasi?: {
    kemampuanQuran?: 'BELUM_BISA' | 'IQRA_DASAR' | 'IQRA_LANJUT' | 'LANCAR_ALQURAN' | 'TAHFIDZ';
    catatanPendampingan?: string;
    catatanWawancara?: string;
    assessedBy?: string;
  };

  berkas: {
    ijazah: boolean;
    kk: boolean;
    akta: boolean;
    foto: boolean;
    kip?: boolean;
  };
  catatanPanitia?: string;
  auditLogs?: Array<{
    action: string;
    actor: string;
    timestamp: string;
    notes?: string;
  }>;
}

interface DrawerProps {
  pendaftar: AdminCalonSiswaItem | null;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    newStatus: AdminCalonSiswaItem['status'],
    catatan?: string,
    extraData?: Partial<AdminCalonSiswaItem>
  ) => void;
}

export const PendaftarDetailDrawer: React.FC<DrawerProps> = ({
  pendaftar,
  onClose,
  onUpdateStatus,
}) => {
  if (!pendaftar) return null;

  const { user, can } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  type ActiveTab = 'biodata' | 'berkas' | 'fisik' | 'observasi' | 'sk' | 'audit';
  const [activeTab, setActiveTab] = useState<ActiveTab>('biodata');
  const [selectedDoc, setSelectedDoc] = useState<'ijazah' | 'kk' | 'akta' | 'foto' | 'kip'>('ijazah');
  const [catatan, setCatatan] = useState(pendaftar.catatanPanitia || '');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // State Verifikasi Fisik
  const [fisikVerified, setFisikVerified] = useState(pendaftar.verifikasiFisik?.verified || false);
  const [fisikNotes, setFisikNotes] = useState(pendaftar.verifikasiFisik?.notes || '');
  const [fisikSaved, setFisikSaved] = useState(false);

  // State Observasi Rombel & Quran
  const [kemampuanQuran, setKemampuanQuran] = useState<any>(
    pendaftar.observasi?.kemampuanQuran || 'LANCAR_ALQURAN'
  );
  const [catatanPendampingan, setCatatanPendampingan] = useState(
    pendaftar.observasi?.catatanPendampingan || 'Mandiri / Siap Belajar Normal'
  );
  const [catatanWawancara, setCatatanWawancara] = useState(
    pendaftar.observasi?.catatanWawancara || 'Siswa kooperatif, sopan, dan minat belajar tinggi.'
  );
  const [observasiSaved, setObservasiSaved] = useState(false);

  const handleSaveFisik = () => {
    if (!can('VERIFY_FISIK')) {
      alert('Akses Ditolak: Anda tidak memiliki wewenang verifikasi fisik.');
      return;
    }
    const actorName = user?.namaLengkap || 'Aila Syifa (Staf TU)';
    onUpdateStatus(pendaftar.id, pendaftar.status, catatan, {
      verifikasiFisik: {
        verified: fisikVerified,
        verifiedBy: actorName,
        verifiedAt: new Date().toLocaleDateString('id-ID'),
        notes: fisikNotes,
      },
      auditLogs: [
        ...(pendaftar.auditLogs || []),
        {
          action: fisikVerified ? 'Verifikasi Fisik Diterima' : 'Verifikasi Fisik Dibatalkan',
          actor: actorName,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          notes: fisikNotes,
        },
      ],
    });
    setFisikSaved(true);
    setTimeout(() => setFisikSaved(false), 2000);
  };

  const handleSaveObservasi = () => {
    if (!can('ASSESS_OBSERVASI')) {
      alert('Akses Ditolak: Anda tidak memiliki wewenang pengisian asesmen observasi.');
      return;
    }
    const actorName = user?.namaLengkap || 'Waka Kesiswaan';
    onUpdateStatus(pendaftar.id, pendaftar.status, catatan, {
      observasi: {
        kemampuanQuran,
        catatanPendampingan,
        catatanWawancara,
        assessedBy: actorName,
      },
      auditLogs: [
        ...(pendaftar.auditLogs || []),
        {
          action: 'Input Hasil Observasi BTQ & Karakter',
          actor: actorName,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          notes: `Quran: ${kemampuanQuran}, Pendampingan: ${catatanPendampingan}`,
        },
      ],
    });
    setObservasiSaved(true);
    setTimeout(() => setObservasiSaved(false), 2000);
  };

  const handleTransitionStatus = (newStatus: AdminCalonSiswaItem['status'], message: string) => {
    const actorName = `${user?.namaLengkap || 'Panitia'} (${user?.role || 'PANITIA'})`;
    onUpdateStatus(pendaftar.id, newStatus, message, {
      auditLogs: [
        ...(pendaftar.auditLogs || []),
        {
          action: `Perubahan Status menjadi ${newStatus}`,
          actor: actorName,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          notes: message,
        },
      ],
    });
  };

  const handleSendWhatsApp = () => {
    const rawHp = pendaftar.noHpOrtu.replace(/^0/, '62').replace(/\D/g, '');
    let msg = `Assalamu'alaikum Wr. Wb. Bpk/Ibu wali dari ananda *${pendaftar.namaLengkap}* (No. Pendaftaran: ${pendaftar.nomorPendaftaran}). `;

    if (pendaftar.status === 'VERIFIED') {
      msg += `Panitia SPMB SMP YAPIA Ciputat menginformasikan bahwa berkas pendaftaran ananda telah *TERVERIFIKASI LENGKAP*. Silakan bersiap untuk tahapan tes seleksi observasi Al-Qur'an dan wawancara. Terima kasih.`;
    } else if (pendaftar.status === 'LOLOS_SELEKSI') {
      msg += `Selamat! Ananda dinyatakan *LOLOS SELEKSI* admisi SMP YAPIA Ciputat. Langkah berikutnya adalah mengikuti kegiatan Masa Pengenalan Lingkungan Sekolah (MPLS). Surat Keputusan resmi dapat diunduh pada portal cek status.`;
    } else if (pendaftar.status === 'REVISI') {
      msg += `Terdapat berkas yang *PERLU DIPERBAIKI*: "${pendaftar.catatanPanitia || 'Mohon cek portal pendaftaran'}". Mohon segera login dan mengunggah ulang dokumen yang jelas. Terima kasih.`;
    } else {
      msg += `Panitia SPMB SMP YAPIA menginformasikan bahwa formulir pendaftaran ananda telah kami terima dan sedang dalam proses verifikasi berkas oleh staf Tata Usaha.`;
    }

    const url = `https://api.whatsapp.com/send?phone=${rawHp}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const docTitles = {
    ijazah: 'Ijazah SD / Surat Keterangan Lulus (SKL)',
    kk: 'Kartu Keluarga (KK)',
    akta: 'Akta Kelahiran Siswa',
    foto: 'Pas Foto 3x4 Calon Siswa',
    kip: 'Kartu Indonesia Pintar (KIP) / Surat Keterangan Tidak Mampu (SKTM)',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop with click to close */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container from Right */}
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full transform transition ease-in-out duration-300 animate-in slide-in-from-right">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-emerald-600 rounded-lg text-white font-bold text-xs tracking-wider shrink-0">
                {pendaftar.nomorPendaftaran}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {pendaftar.namaLengkap}
                  </h3>
                  {pendaftar.jalurPendaftaran === 'AFIRMASI' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shrink-0">
                      <Award className="w-3 h-3" /> AFIRMASI (KIP)
                    </span>
                  )}
                  {pendaftar.verifikasiFisik?.verified && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-3 h-3" /> FISIK: VALID
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  NISN: {pendaftar.nisn} • Asal: {pendaftar.sekolahAsal} ({pendaftar.kecamatanAsal || 'Ciputat'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSendWhatsApp}
                title="Kirim pesan WhatsApp langsung ke orang tua"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> <span className="hidden sm:inline">WA Orang Tua</span>
              </button>
              <button
                onClick={onClose}
                title="Tutup Drawer (Esc)"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Sub-Header Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-5 flex items-center justify-between overflow-x-auto">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('biodata')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'biodata'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Biodata Siswa (A-D)
            </button>
            <button
              onClick={() => setActiveTab('berkas')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'berkas'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Berkas Digital (E)
            </button>
            <button
              onClick={() => setActiveTab('fisik')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'fisik'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              3. Verifikasi Fisik TU
              {pendaftar.verifikasiFisik?.verified && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('observasi')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'observasi'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              4. Observasi BTQ & Rombel
            </button>
            <button
              onClick={() => setActiveTab('sk')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'sk'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              5. SK Kelulusan Digital
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              Audit Log
            </button>
          </div>

          <div className="text-xs shrink-0 py-2">
            <span className="text-slate-500 mr-2 hidden sm:inline">Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                pendaftar.status === 'DITERIMA_RESMI'
                  ? 'bg-emerald-600 text-white'
                  : pendaftar.status === 'LOLOS_SELEKSI'
                  ? 'bg-blue-600 text-white'
                  : pendaftar.status === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : pendaftar.status === 'REVISI'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendaftar.status}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: BIODATA */}
          {activeTab === 'biodata' && (
            <div className="space-y-6">
              {/* Banner Afirmasi & PDP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Jalur Pendaftaran: {pendaftar.jalurPendaftaran}
                    </h4>
                    <p className="text-xs text-amber-800">
                      {pendaftar.jalurPendaftaran === 'AFIRMASI'
                        ? `Nomor KIP/SKTM: ${pendaftar.nomorKipSktm || '-'} (Mendapatkan penyesuaian tarif formulir/subsidi).`
                        : 'Jalur umum reguler penerimaan calon peserta didik baru.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">
                      Kepatuhan UU PDP No. 27/2022
                    </h4>
                    <p className="text-xs text-blue-800">
                      Wali murid telah memberikan persetujuan eksplisit (Consent ID: PDP-CONFIRMED) untuk pemrosesan data Dapodik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Siswa & Ortu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                    A. Data Calon Siswa & Sekolah
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Nama Lengkap:</span>
                      <span className="font-bold text-slate-800">{pendaftar.namaLengkap}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">NISN / NIK:</span>
                      <span className="font-bold text-slate-800">{pendaftar.nisn} / {pendaftar.nik || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Jenis Kelamin:</span>
                      <span className="font-bold text-slate-800">{pendaftar.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tempat, Tgl Lahir:</span>
                      <span className="font-bold text-slate-800">{pendaftar.tempatLahir}, {pendaftar.tanggalLahir}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sekolah Asal:</span>
                      <span className="font-bold text-slate-800">{pendaftar.sekolahAsal}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Kecamatan Asal:</span>
                      <span className="font-bold text-slate-800">{pendaftar.kecamatanAsal || 'Ciputat'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                    B. Orang Tua & Tempat Tinggal
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Nama Orang Tua:</span>
                      <span className="font-bold text-slate-800">{pendaftar.namaOrtu}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">No. WhatsApp Wali:</span>
                      <span className="font-bold text-emerald-700">{pendaftar.noHpOrtu}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Alamat Tinggal:</span>
                      <span className="font-medium text-slate-800">{pendaftar.alamat}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BERKAS DIGITAL */}
          {activeTab === 'berkas' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Pilih Dokumen Unggahan:</span>
                {(['ijazah', 'kk', 'akta', 'foto', ...(pendaftar.jalurPendaftaran === 'AFIRMASI' ? ['kip' as const] : [])] as const).map((docKey) => (
                  <button
                    key={docKey}
                    onClick={() => setSelectedDoc(docKey)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      selectedDoc === docKey
                        ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{docTitles[docKey]}</span>
                    {pendaftar.berkas[docKey as keyof typeof pendaftar.berkas] ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    )}
                  </button>
                ))}
              </div>

              <div className="md:col-span-2 bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] text-white">
                <FileText className="w-16 h-16 text-emerald-400 mb-3 opacity-90" />
                <h4 className="text-sm font-bold">{docTitles[selectedDoc]}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Status: {pendaftar.berkas[selectedDoc as keyof typeof pendaftar.berkas] ? 'Sudah Terunggah (Dokumen Sah)' : 'Belum Ada'}
                </p>
                <button
                  onClick={() => alert(`Membuka berkas dokumen: ${docTitles[selectedDoc]}`)}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Dokumen Penuh
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIKASI FISIK TU (GOLDEN RECORD) */}
          {activeTab === 'fisik' && (
            <div className="space-y-5 bg-blue-50/40 p-5 rounded-2xl border border-blue-200">
              <div className="flex items-start gap-3">
                <FileCheck2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-950">
                    Modul Verifikasi Berkas Fisik TU (Two-Eyes Principle)
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                    Sesuai hasil audit, rujukan utama data adalah <strong>berkas fisik asli</strong>. Tandai verifikasi setelah staf TU memeriksa langsung keaslian fotokopi KK, Akta Kelahiran, dan Ijazah/SKL sebelum ditarik ke Dapodik.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-blue-200 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fisikVerified}
                    onChange={(e) => setFisikVerified(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      Berkas Fisik Telah Diterima & Diverifikasi Sah oleh Staf TU
                    </span>
                    <span className="text-xs text-slate-500">
                      Centang jika map berkas fisik (Ijazah legalisir, KK, Akta, Pas Foto) telah disimpan di lemari arsip TU.
                    </span>
                  </div>
                </label>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Pemeriksaan Fisik TU:
                  </label>
                  <textarea
                    rows={2}
                    value={fisikNotes}
                    onChange={(e) => setFisikNotes(e.target.value)}
                    placeholder="Contoh: Dokumen fisik lengkap, nomor seri ijazah cocok dengan NISN pusat."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    Pemeriksa Terakhir: <strong>{pendaftar.verifikasiFisik?.verifiedBy || 'Belum diperiksa'}</strong> ({pendaftar.verifikasiFisik?.verifiedAt || '-'})
                  </div>
                  <Button onClick={handleSaveFisik} className="text-xs py-2 bg-blue-600 hover:bg-blue-700">
                    {fisikSaved ? '✓ Tersimpan!' : 'Simpan Verifikasi Fisik TU'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASESMEN & OBSERVASI BTQ / ROMBEL */}
          {activeTab === 'observasi' && (
            <div className="space-y-5 bg-amber-50/40 p-5 rounded-2xl border border-amber-200">
              <div className="flex items-start gap-3">
                <BookOpen className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    Catatan Asesmen Observasi Al-Qur'an & Rombel (Waka Kesiswaan)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Sesuai format angket hasil tes seleksi, data ini diserahkan kepada Waka Kesiswaan untuk pembagian rombongan belajar (rombel) dan guru wali kelas.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kemampuan Membaca Al-Qur'an / BTQ:
                    </label>
                    <select
                      value={kemampuanQuran}
                      onChange={(e) => setKemampuanQuran(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="BELUM_BISA">Belum Bisa Baca Al-Qur'an / Perlu Bimbingan Dasar</option>
                      <option value="IQRA_DASAR">Iqra Jilid 1 - 3 (Mengenal Huruf Hijaiyah)</option>
                      <option value="IQRA_LANJUT">Iqra Jilid 4 - 6 (Mulai Merangkai Bacaan)</option>
                      <option value="LANCAR_ALQURAN">Lancar Membaca Al-Qur'an dengan Tajwid Standar</option>
                      <option value="TAHFIDZ">Tahfidz Qur'an (Memiliki Hafalan Juz 30 / Lebih)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kebutuhan Pendampingan / Status Literasi:
                    </label>
                    <input
                      type="text"
                      value={catatanPendampingan}
                      onChange={(e) => setCatatanPendampingan(e.target.value)}
                      placeholder="Contoh: Mandiri / Perlu Bimbingan Baca-Tulis / ABK"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Wawancara Karakter & Bakat Minat:
                  </label>
                  <textarea
                    rows={2}
                    value={catatanWawancara}
                    onChange={(e) => setCatatanWawancara(e.target.value)}
                    placeholder="Catatan kepribadian siswa, minat ekstrakurikuler, dan komitmen orang tua..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveObservasi} className="text-xs py-2 bg-amber-600 hover:bg-amber-700">
                    {observasiSaved ? '✓ Tersimpan!' : 'Simpan Catatan Observasi Rombel'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SURAT KEPUTUSAN (SK) KELULUSAN RESMI */}
          {activeTab === 'sk' && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-xs max-w-2xl mx-auto space-y-4 text-slate-900 font-serif">
                {/* Kop Surat */}
                <div className="text-center border-b-2 border-slate-900 pb-3 font-sans">
                  <h3 className="text-sm font-black tracking-wider uppercase">
                    YAYASAN PENDIDIKAN ISLAM DAN SOSIAL CIPUTAT
                  </h3>
                  <h2 className="text-base font-black text-emerald-800">
                    SMP YAPIA CIPUTAT
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    Jl. Ki Hajar Dewantara No. 12, Ciputat, Tangerang Selatan • Telp: (021) 749-1234
                  </p>
                </div>

                <div className="text-center font-sans">
                  <h4 className="text-xs font-bold uppercase underline">
                    SURAT KEPUTUSAN PENETAPAN PENERIMAAN SISWA BARU
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Nomor: {pendaftar.nomorPendaftaran}/SPMB-SMP/2026
                  </p>
                </div>

                <p className="text-xs leading-relaxed font-sans">
                  Berdasarkan hasil verifikasi administrasi dan tes seleksi SPMB Tahun Ajaran 2026/2027, Kepala SMP YAPIA Ciputat menerangkan bahwa:
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-sans space-y-1">
                  <div><strong>Nama Siswa:</strong> {pendaftar.namaLengkap}</div>
                  <div><strong>NISN:</strong> {pendaftar.nisn}</div>
                  <div><strong>Sekolah Asal:</strong> {pendaftar.sekolahAsal}</div>
                  <div><strong>Jalur:</strong> {pendaftar.jalurPendaftaran}</div>
                  <div><strong>Status:</strong> <span className="font-bold text-emerald-700">{pendaftar.status}</span></div>
                </div>

                <p className="text-xs leading-relaxed font-sans">
                  Dinyatakan berhak melanjutkan ke tahapan <strong>Masa Pengenalan Lingkungan Sekolah (MPLS)</strong> dan registrasi penetapan siswa resmi SMP YAPIA Ciputat.
                </p>

                {/* Tanda Tangan Kepsek */}
                <div className="pt-4 flex justify-between items-end font-sans">
                  <div className="text-center text-[10px] text-slate-500">
                    <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center font-mono text-[9px] text-slate-400">
                      [QR VALIDASI]
                    </div>
                    Scan Verifikasi Digital
                  </div>
                  <div className="text-right text-xs">
                    <div>Tangerang Selatan, {new Date().toLocaleDateString('id-ID')}</div>
                    <div className="text-[11px] font-bold mt-1">Kepala Sekolah SMP YAPIA,</div>
                    <div className="mt-8 font-bold underline">Via Aprilian Safitri Nur, S.Kom</div>
                    <div className="text-[10px] text-slate-500">NIP. 19880412 201201 2 001</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => window.print()} className="text-xs py-2 bg-indigo-600 hover:bg-indigo-700">
                  <Printer className="w-4 h-4" /> Cetak / Unduh Dokumen SK Resmi PDF
                </Button>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Log Audit & Jejak Rekam Aktivitas Calon Siswa
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                {(pendaftar.auditLogs && pendaftar.auditLogs.length > 0 ? pendaftar.auditLogs : [
                  { action: 'Pendaftaran Dibuat Secara Online', actor: 'Wali Murid', timestamp: '16 Okt 2026, 09:30', notes: 'Formulir berhasil terkirim ke SIPMB.' },
                  { action: 'Verifikasi Berkas Digital', actor: 'Ruslan Setiawan (Operator)', timestamp: '16 Okt 2026, 10:15', notes: 'Dokumen diunggah dinyatakan lengkap.' }
                ]).map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-b border-slate-200 pb-2.5 last:border-0 last:pb-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Oleh: <strong>{log.actor}</strong> {log.notes && `— ${log.notes}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Minta Revisi */}
          {showRejectForm && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-rose-900 block">
                Catatan Revisi / Alasan Penolakan untuk Orang Tua:
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Foto Kartu Keluarga buram, mohon unggah ulang scan dokumen yang lebih jelas."
                className="w-full p-2.5 rounded-lg border border-rose-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectForm(false)} className="text-xs py-1.5">
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleTransitionStatus('REVISI', catatan);
                    setShowRejectForm(false);
                  }}
                  className="text-xs py-1.5"
                >
                  Kirim Status Revisi
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Progressive Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {!showRejectForm && (
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                className="text-xs py-1.5 border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Minta Revisi
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pendaftar.status === 'SUBMITTED' && (
              can('VERIFY_BERKAS') ? (
                <Button
                  onClick={() => handleTransitionStatus('VERIFIED', 'Berkas pendaftaran diverifikasi lengkap oleh staf TU.')}
                  className="text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> 1. Verifikasi Berkas
                </Button>
              ) : (
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Menunggu verifikasi berkas oleh Staf TU / Operator
                </span>
              )
            )}

            {pendaftar.status === 'VERIFIED' && (
              can('APPROVE_KELULUSAN') ? (
                <Button
                  onClick={() => handleTransitionStatus('LOLOS_SELEKSI', 'Siswa dinyatakan lolos tes seleksi BTQ dan observasi.')}
                  className="text-xs py-1.5 bg-blue-600 hover:bg-blue-700 font-bold"
                >
                  <Award className="w-3.5 h-3.5" /> 2. Tetapkan Lolos Seleksi (Kepsek)
                </Button>
              ) : (
                <span className="text-[11px] text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold">
                  Otorisasi Kelulusan Khusus Kepala Sekolah
                </span>
              )
            )}

            {pendaftar.status === 'LOLOS_SELEKSI' && (
              can('APPROVE_KELULUSAN') ? (
                <Button
                  onClick={() => handleTransitionStatus('MENGIKUTI_MPLS', 'Siswa terdaftar dalam rombel pelaksanaan kegiatan MPLS.')}
                  className="text-xs py-1.5 bg-purple-600 hover:bg-purple-700"
                >
                  <BookOpen className="w-3.5 h-3.5" /> 3. Mulai Ikuti MPLS
                </Button>
              ) : (
                <span className="text-[11px] text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg font-semibold">
                  Tahap MPLS Menunggu Penetapan Panitia
                </span>
              )
            )}

            {pendaftar.status === 'MENGIKUTI_MPLS' && (
              can('APPROVE_KELULUSAN') ? (
                <Button
                  onClick={() => handleTransitionStatus('DITERIMA_RESMI', 'Siswa telah menyelesaikan MPLS dan resmi aktif di SMP YAPIA.')}
                  className="text-xs py-1.5 bg-emerald-700 hover:bg-emerald-800 font-bold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> 4. Diterima Resmi (Kepsek)
                </Button>
              ) : (
                <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                  Penetapan Siswa Resmi oleh Kepala Sekolah
                </span>
              )
            )}

            <Button variant="outline" onClick={onClose} className="text-xs py-1.5 cursor-pointer">
              Tutup Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// Export backward compatible alias
export const PendaftarDetailModal = PendaftarDetailDrawer;

