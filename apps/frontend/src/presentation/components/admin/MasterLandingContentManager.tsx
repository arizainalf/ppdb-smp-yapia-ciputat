import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Sparkles,
  LayoutTemplate,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  ListOrdered,
  Megaphone,
  Check,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { InputField } from '../common/InputField.js';
import type { LandingContentDTO } from '@yapia/shared';

const DEFAULT_CONTENT: LandingContentDTO = {
  hero: {
    badgeText: 'PENDAFTARAN RESMI DIBUKA: TAHUN AJARAN 2026/2027',
    heroTitle: 'Mewujudkan Generasi Islami, Cerdas & Berakhlak Mulia',
    heroHighlight: 'Cerdas',
    heroSubtitle:
      'Selamat datang di Portal Resmi Sistem Informasi Penerimaan Murid Baru (SIPMB) SMP YAPIA Ciputat. Proses pendaftaran mudah, transparan, dan terverifikasi secara online.',
    heroDaftarBtn: 'Daftar Sekarang',
    heroCekStatusBtn: 'Cek Status Pendaftaran',
  },
  metrics: {
    metric1Title: 'Akreditasi A',
    metric1Subtitle: 'Kemendikbudristek',
    metric2Title: '100% Online',
    metric2Subtitle: 'Tanpa Antre di Sekolah',
    metric3Title: '24 Jam',
    metric3Subtitle: 'Akses Formulir Kapanpun',
    metric4Title: 'WhatsApp Notif',
    metric4Subtitle: 'Update Status Realtime',
  },
  syarat: {
    syaratBadge: 'Persyaratan PPDB',
    syaratTitle: 'Dokumen Persyaratan yang Perlu Disiapkan',
    syaratSubtitle: 'Pastikan Anda telah menyiapkan foto atau scan berkas dokumen berikut sebelum mengisi formulir:',
    syarat1Title: 'Ijazah SD / Surat Keterangan Lulus (SKL)',
    syarat1Desc: 'Scan asli atau fotokopi legalisir yang memuat nama siswa dan NISN yang jelas.',
    syarat2Title: 'Kartu Keluarga (KK)',
    syarat2Desc: 'Scan Kartu Keluarga yang mencantumkan nama orang tua/wali serta Nomor Induk Kependudukan (NIK).',
    syarat3Title: 'Akta Kelahiran Calon Siswa',
    syarat3Desc: 'Scan Akta Kelahiran resmi dari Dukcapil untuk verifikasi tanggal lahir dan usia anak.',
  },
  panduan: {
    panduanBadge: 'Panduan Pendaftaran',
    panduanTitle: '4 Langkah Mudah Pendaftaran Online',
    step1Title: 'Isi Biodata Lengkap',
    step1Desc: 'Isi data calon siswa, riwayat SD asal, alamat domisili, dan data orang tua/wali.',
    step2Title: 'Unggah Scan Dokumen',
    step2Desc: 'Upload dokumen Ijazah/SKL, KK, dan Akta Kelahiran langsung dari ponsel/laptop.',
    step3Title: 'Verifikasi Panitia',
    step3Desc: 'Panitia PPDB memverifikasi keabsahan berkas Anda dalam waktu 1x24 jam kerja.',
    step4Title: 'Cetak Bukti Pendaftaran',
    step4Desc: 'Dapatkan lembar bukti pendaftaran ber-QR Code untuk registrasi ulang di sekolah.',
  },
  cta: {
    ctaBadge: 'PPDB ONLINE T.A 2026/2027 • KUOTA GELOMBANG TERBATAS',
    ctaTitle: 'Siap Mendaftarkan Putra/Putri Anda di SMP YAPIA Ciputat?',
    ctaSubtitle:
      'Pengisian formulir praktis dalam 5 tahap, berkas diunggah langsung melalui ponsel, dan nomor registrasi resmi diterbitkan secara instan.',
    ctaPrimaryBtn: 'Mulai Pengisian Formulir Sekarang',
    ctaSecondaryBtn: 'Sudah Mendaftar? Cek Status & SK',
    ctaChip1: 'Pengisian 5 Menit Selesai',
    ctaChip2: 'Kepatuhan UU PDP No. 27/2022',
    ctaChip3: 'Helpdesk WhatsApp 24 Jam',
  },
  kontak: {
    namaSekolah: 'SMP YAPIA CIPUTAT',
    deskripsiSekolah:
      'Membentuk generasi berakhlak mulia, berprestasi akademik, dan siap menghadapi tantangan era digital dengan nilai-nilai Islam.',
    npsn: '20603210',
    akreditasi: 'Akreditasi A',
    alamatSekolah: 'Jl. KH. Dewantara No. 12, Ciputat, Kota Tangerang Selatan, Banten 15411',
    telepon: '(021) 749-XXXX',
    whatsapp: '0812-3456-7890',
    email: 'ppdb@smp-yapia.sch.id',
    jadwalPelayanan: 'Senin – Jumat: 08.00 – 15.00 WIB | Sabtu: 08.00 – 12.00 WIB (Helpdesk Offline)',
  },
};

type TabKey = 'hero' | 'metrics' | 'syarat' | 'panduan' | 'cta' | 'kontak';

export const MasterLandingContentManager: React.FC = () => {
  const [content, setContent] = useState<LandingContentDTO>(DEFAULT_CONTENT);
  const [activeTab, setActiveTab] = useState<TabKey>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Fetch current content from database
  const loadContent = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/content/landing`);
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setContent(json.data);
      }
    } catch (err: any) {
      console.error('Gagal mengambil konten beranda:', err);
      setErrorMessage('Gagal memuat konten dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  // Save changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccessMessage(null);
      setErrorMessage(null);

      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/content/landing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedBy: 'Super Admin',
          content,
        }),
      });

      const json = await res.json();
      if (json.status === 'success') {
        setContent(json.data);
        setSaveSuccessMessage('Perubahan konten berhasil disimpan dan langsung tayang di beranda!');
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      } else {
        setErrorMessage(json.message || 'Gagal menyimpan perubahan.');
      }
    } catch (err: any) {
      console.error('Error saving landing content:', err);
      setErrorMessage('Terjadi kesalahan jaringan saat menyimpan konten.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin mereset seluruh teks beranda ke konfigurasi awal (bawaan sistem)?'
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/content/landing/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedBy: 'Super Admin (Reset)' }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setContent(json.data);
        setSaveSuccessMessage('Konten beranda berhasil direset ke pengaturan default.');
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Error resetting content:', err);
      setErrorMessage('Gagal mereset konten.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper update handlers
  const updateHero = (field: keyof LandingContentDTO['hero'], value: string) => {
    setContent((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateMetrics = (field: keyof LandingContentDTO['metrics'], value: string) => {
    setContent((prev) => ({
      ...prev,
      metrics: { ...prev.metrics, [field]: value },
    }));
  };

  const updateSyarat = (field: keyof LandingContentDTO['syarat'], value: string) => {
    setContent((prev) => ({
      ...prev,
      syarat: { ...prev.syarat, [field]: value },
    }));
  };

  const updatePanduan = (field: keyof LandingContentDTO['panduan'], value: string) => {
    setContent((prev) => ({
      ...prev,
      panduan: { ...prev.panduan, [field]: value },
    }));
  };

  const updateCta = (field: keyof LandingContentDTO['cta'], value: string) => {
    setContent((prev) => ({
      ...prev,
      cta: { ...prev.cta, [field]: value },
    }));
  };

  const updateKontak = (field: keyof LandingContentDTO['kontak'], value: string) => {
    setContent((prev) => ({
      ...prev,
      kontak: { ...prev.kontak, [field]: value },
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Memuat konfigurasi konten beranda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Khusus Super Admin
            </span>
            {content.updatedAt && (
              <span className="text-[11px] text-slate-400">
                Terakhir disimpan:{' '}
                {new Date(content.updatedAt).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-emerald-600" />
            Manajemen Konten Beranda (CMS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Kelola judul hero, teks keunggulan, panduan 4 langkah, banner CTA pendaftaran, dan kontak sekolah secara langsung. Perubahan akan langsung tercermin di halaman depan website.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="text-xs text-slate-600 hover:text-rose-600 hover:border-rose-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Default
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-sm"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Simpan & Publikasikan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Realtime Live Preview Strip */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pratinjau Langsung (Live Preview Hero)
            </span>
          </div>
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="text-[11px] text-emerald-400 hover:underline font-semibold"
          >
            {showLivePreview ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>

        {showLivePreview && (
          <div className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 p-6 rounded-xl border border-emerald-700/40 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {content.hero.badgeText}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white max-w-xl mx-auto leading-snug">
              {content.hero.heroTitle}
            </h3>

            <p className="text-xs text-emerald-100/80 max-w-lg mx-auto font-normal">
              {content.hero.heroSubtitle}
            </p>

            <div className="flex justify-center gap-2 pt-2">
              <span className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs shadow-md">
                {content.hero.heroDaftarBtn} &rarr;
              </span>
              <span className="px-4 py-2 bg-emerald-400 text-slate-800 font-bold rounded-lg text-xs border border-emerald-400">
                {content.hero.heroCekStatusBtn}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-emerald-800/60 max-w-2xl mx-auto text-left">
              <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/30">
                <span className="text-emerald-400 font-bold text-xs">{content.metrics.metric1Title}</span>
                <p className="text-[10px] text-emerald-200/70">{content.metrics.metric1Subtitle}</p>
              </div>
              <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/30">
                <span className="text-emerald-400 font-bold text-xs">{content.metrics.metric2Title}</span>
                <p className="text-[10px] text-emerald-200/70">{content.metrics.metric2Subtitle}</p>
              </div>
              <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/30">
                <span className="text-emerald-400 font-bold text-xs">{content.metrics.metric3Title}</span>
                <p className="text-[10px] text-emerald-200/70">{content.metrics.metric3Subtitle}</p>
              </div>
              <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/30">
                <span className="text-emerald-400 font-bold text-xs">{content.metrics.metric4Title}</span>
                <p className="text-[10px] text-emerald-200/70">{content.metrics.metric4Subtitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 bg-white px-4 pt-2 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'hero'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 1. Hero & Headline
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> 2. Poin Keunggulan (4 Kartu)
        </button>

        <button
          onClick={() => setActiveTab('syarat')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'syarat'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> 3. Syarat Dokumen
        </button>

        <button
          onClick={() => setActiveTab('panduan')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'panduan'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ListOrdered className="w-4 h-4" /> 4. Alur (4 Langkah)
        </button>

        <button
          onClick={() => setActiveTab('cta')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cta'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Megaphone className="w-4 h-4" /> 5. Banner CTA Bawah
        </button>

        <button
          onClick={() => setActiveTab('kontak')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'kontak'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" /> 6. Info Sekolah & Kontak
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 rounded-b-2xl border-x border-b border-slate-200 shadow-xs space-y-6">
        {/* TAB 1: HERO SECTION */}
        {activeTab === 'hero' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pengaturan Hero Banner Utama</h3>
              <p className="text-xs text-slate-500">
                Ubah teks banner paling atas yang pertama kali dilihat oleh calon pendaftar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Teks Badge Pembuka (Paling Atas)"
                  value={content.hero.badgeText}
                  onChange={(e) => updateHero('badgeText', e.target.value)}
                  placeholder="PENDAFTARAN RESMI DIBUKA: TAHUN AJARAN 2026/2027"
                  helperText="Contoh: PENDAFTARAN RESMI DIBUKA: TAHUN AJARAN 2026/2027"
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Judul Utama (H1 Headline)"
                  value={content.hero.heroTitle}
                  onChange={(e) => updateHero('heroTitle', e.target.value)}
                  placeholder="Mewujudkan Generasi Islami, Cerdas & Berakhlak Mulia"
                  helperText="Judul besar utama di bagian paling atas halaman beranda."
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Sub-Judul / Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={content.hero.heroSubtitle}
                  onChange={(e) => updateHero('heroSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                  placeholder="Deskripsi sambutan pendaftaran PPDB..."
                />
                <span className="text-[11px] text-slate-400">
                  Kalimat pembuka yang menjelaskan portal resmi pendaftaran.
                </span>
              </div>

              <div>
                <InputField
                  label="Teks Tombol Pendaftaran Utama"
                  value={content.hero.heroDaftarBtn}
                  onChange={(e) => updateHero('heroDaftarBtn', e.target.value)}
                  placeholder="Daftar Sekarang"
                />
              </div>

              <div>
                <InputField
                  label="Teks Tombol Cek Status"
                  value={content.hero.heroCekStatusBtn}
                  onChange={(e) => updateHero('heroCekStatusBtn', e.target.value)}
                  placeholder="Cek Status Pendaftaran"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: METRICS / KEUNGGULAN */}
        {activeTab === 'metrics' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">4 Poin Keunggulan (Metrics Cards)</h3>
              <p className="text-xs text-slate-500">
                4 kotak keunggulan tepat di bawah tombol pendaftaran hero.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Kartu Keunggulan 1
                </span>
                <InputField
                  label="Judul Kartu 1"
                  value={content.metrics.metric1Title}
                  onChange={(e) => updateMetrics('metric1Title', e.target.value)}
                  placeholder="Akreditasi A"
                />
                <InputField
                  label="Sub-keterangan Kartu 1"
                  value={content.metrics.metric1Subtitle}
                  onChange={(e) => updateMetrics('metric1Subtitle', e.target.value)}
                  placeholder="Kemendikbudristek"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Kartu Keunggulan 2
                </span>
                <InputField
                  label="Judul Kartu 2"
                  value={content.metrics.metric2Title}
                  onChange={(e) => updateMetrics('metric2Title', e.target.value)}
                  placeholder="100% Online"
                />
                <InputField
                  label="Sub-keterangan Kartu 2"
                  value={content.metrics.metric2Subtitle}
                  onChange={(e) => updateMetrics('metric2Subtitle', e.target.value)}
                  placeholder="Tanpa Antre di Sekolah"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Kartu Keunggulan 3
                </span>
                <InputField
                  label="Judul Kartu 3"
                  value={content.metrics.metric3Title}
                  onChange={(e) => updateMetrics('metric3Title', e.target.value)}
                  placeholder="24 Jam"
                />
                <InputField
                  label="Sub-keterangan Kartu 3"
                  value={content.metrics.metric3Subtitle}
                  onChange={(e) => updateMetrics('metric3Subtitle', e.target.value)}
                  placeholder="Akses Formulir Kapanpun"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Kartu Keunggulan 4
                </span>
                <InputField
                  label="Judul Kartu 4"
                  value={content.metrics.metric4Title}
                  onChange={(e) => updateMetrics('metric4Title', e.target.value)}
                  placeholder="WhatsApp Notif"
                />
                <InputField
                  label="Sub-keterangan Kartu 4"
                  value={content.metrics.metric4Subtitle}
                  onChange={(e) => updateMetrics('metric4Subtitle', e.target.value)}
                  placeholder="Update Status Realtime"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYARAT DOKUMEN */}
        {activeTab === 'syarat' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Persyaratan Dokumen PPDB</h3>
              <p className="text-xs text-slate-500">
                Informasi dokumen yang harus disiapkan orang tua siswa sebelum mengisi formulir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputField
                  label="Teks Badge Bagian"
                  value={content.syarat.syaratBadge}
                  onChange={(e) => updateSyarat('syaratBadge', e.target.value)}
                  placeholder="Persyaratan PPDB"
                />
              </div>

              <div>
                <InputField
                  label="Judul Bagian Dokumen"
                  value={content.syarat.syaratTitle}
                  onChange={(e) => updateSyarat('syaratTitle', e.target.value)}
                  placeholder="Dokumen Persyaratan yang Perlu Disiapkan"
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Sub-judul Penjelas"
                  value={content.syarat.syaratSubtitle}
                  onChange={(e) => updateSyarat('syaratSubtitle', e.target.value)}
                  placeholder="Pastikan Anda telah menyiapkan foto atau scan berkas dokumen berikut..."
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Dokumen 1</span>
                <InputField
                  label="Nama Dokumen 1"
                  value={content.syarat.syarat1Title}
                  onChange={(e) => updateSyarat('syarat1Title', e.target.value)}
                  placeholder="Ijazah SD / Surat Keterangan Lulus (SKL)"
                />
                <InputField
                  label="Penjelasan Dokumen 1"
                  value={content.syarat.syarat1Desc}
                  onChange={(e) => updateSyarat('syarat1Desc', e.target.value)}
                  placeholder="Scan asli atau fotokopi legalisir..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Dokumen 2</span>
                <InputField
                  label="Nama Dokumen 2"
                  value={content.syarat.syarat2Title}
                  onChange={(e) => updateSyarat('syarat2Title', e.target.value)}
                  placeholder="Kartu Keluarga (KK)"
                />
                <InputField
                  label="Penjelasan Dokumen 2"
                  value={content.syarat.syarat2Desc}
                  onChange={(e) => updateSyarat('syarat2Desc', e.target.value)}
                  placeholder="Scan Kartu Keluarga..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Dokumen 3</span>
                <InputField
                  label="Nama Dokumen 3"
                  value={content.syarat.syarat3Title}
                  onChange={(e) => updateSyarat('syarat3Title', e.target.value)}
                  placeholder="Akta Kelahiran Calon Siswa"
                />
                <InputField
                  label="Penjelasan Dokumen 3"
                  value={content.syarat.syarat3Desc}
                  onChange={(e) => updateSyarat('syarat3Desc', e.target.value)}
                  placeholder="Scan Akta Kelahiran resmi dari Dukcapil..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PANDUAN 4 LANGKAH */}
        {activeTab === 'panduan' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Panduan 4 Langkah Pendaftaran</h3>
              <p className="text-xs text-slate-500">
                Alur alur pendaftaran langkah demi langkah untuk memandu orang tua.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputField
                  label="Teks Badge Bagian"
                  value={content.panduan.panduanBadge}
                  onChange={(e) => updatePanduan('panduanBadge', e.target.value)}
                  placeholder="Panduan Pendaftaran"
                />
              </div>

              <div>
                <InputField
                  label="Judul Bagian Panduan"
                  value={content.panduan.panduanTitle}
                  onChange={(e) => updatePanduan('panduanTitle', e.target.value)}
                  placeholder="4 Langkah Mudah Pendaftaran Online"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Langkah 1</span>
                <InputField
                  label="Judul Langkah 1"
                  value={content.panduan.step1Title}
                  onChange={(e) => updatePanduan('step1Title', e.target.value)}
                  placeholder="Isi Biodata Lengkap"
                />
                <InputField
                  label="Deskripsi Langkah 1"
                  value={content.panduan.step1Desc}
                  onChange={(e) => updatePanduan('step1Desc', e.target.value)}
                  placeholder="Isi data calon siswa..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Langkah 2</span>
                <InputField
                  label="Judul Langkah 2"
                  value={content.panduan.step2Title}
                  onChange={(e) => updatePanduan('step2Title', e.target.value)}
                  placeholder="Unggah Scan Dokumen"
                />
                <InputField
                  label="Deskripsi Langkah 2"
                  value={content.panduan.step2Desc}
                  onChange={(e) => updatePanduan('step2Desc', e.target.value)}
                  placeholder="Upload dokumen Ijazah..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Langkah 3</span>
                <InputField
                  label="Judul Langkah 3"
                  value={content.panduan.step3Title}
                  onChange={(e) => updatePanduan('step3Title', e.target.value)}
                  placeholder="Verifikasi Panitia"
                />
                <InputField
                  label="Deskripsi Langkah 3"
                  value={content.panduan.step3Desc}
                  onChange={(e) => updatePanduan('step3Desc', e.target.value)}
                  placeholder="Panitia PPDB memverifikasi berkas..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700">Langkah 4</span>
                <InputField
                  label="Judul Langkah 4"
                  value={content.panduan.step4Title}
                  onChange={(e) => updatePanduan('step4Title', e.target.value)}
                  placeholder="Cetak Bukti Pendaftaran"
                />
                <InputField
                  label="Deskripsi Langkah 4"
                  value={content.panduan.step4Desc}
                  onChange={(e) => updatePanduan('step4Desc', e.target.value)}
                  placeholder="Dapatkan lembar bukti pendaftaran..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BANNER CTA BAWAH */}
        {activeTab === 'cta' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Banner Call-To-Action (CTA) Bawah</h3>
              <p className="text-xs text-slate-500">
                Kartu ajakan pendaftaran di bagian bawah halaman beranda dengan konversi tinggi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Teks Badge Banner CTA"
                  value={content.cta.ctaBadge}
                  onChange={(e) => updateCta('ctaBadge', e.target.value)}
                  placeholder="PPDB ONLINE T.A 2026/2027 • KUOTA GELOMBANG TERBATAS"
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Judul Ajakan CTA (H3 Headline)"
                  value={content.cta.ctaTitle}
                  onChange={(e) => updateCta('ctaTitle', e.target.value)}
                  placeholder="Siap Mendaftarkan Putra/Putri Anda di SMP YAPIA Ciputat?"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Sub-judul / Penjelasan CTA
                </label>
                <textarea
                  rows={2}
                  value={content.cta.ctaSubtitle}
                  onChange={(e) => updateCta('ctaSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                  placeholder="Pengisian formulir praktis dalam 5 tahap..."
                />
              </div>

              <div>
                <InputField
                  label="Teks Tombol CTA Utama"
                  value={content.cta.ctaPrimaryBtn}
                  onChange={(e) => updateCta('ctaPrimaryBtn', e.target.value)}
                  placeholder="Mulai Pengisian Formulir Sekarang"
                />
              </div>

              <div>
                <InputField
                  label="Teks Tombol Sekunder"
                  value={content.cta.ctaSecondaryBtn}
                  onChange={(e) => updateCta('ctaSecondaryBtn', e.target.value)}
                  placeholder="Sudah Mendaftar? Cek Status & SK"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                3 Poin Kepercayaan / Reassurance Chips (Bawah Tombol CTA):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputField
                  label="Chip Kepercayaan 1"
                  value={content.cta.ctaChip1}
                  onChange={(e) => updateCta('ctaChip1', e.target.value)}
                  placeholder="Pengisian 5 Menit Selesai"
                />
                <InputField
                  label="Chip Kepercayaan 2"
                  value={content.cta.ctaChip2}
                  onChange={(e) => updateCta('ctaChip2', e.target.value)}
                  placeholder="Kepatuhan UU PDP No. 27/2022"
                />
                <InputField
                  label="Chip Kepercayaan 3"
                  value={content.cta.ctaChip3}
                  onChange={(e) => updateCta('ctaChip3', e.target.value)}
                  placeholder="Helpdesk WhatsApp 24 Jam"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: INFO SEKOLAH & KONTAK */}
        {activeTab === 'kontak' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Informasi Lembaga & Kontak Helpdesk</h3>
              <p className="text-xs text-slate-500">
                Informasi identitas sekolah yang ditampilkan di footer, kontak bantuan orang tua, dan jam layanan PPDB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InputField
                  label="Nama Resmi Sekolah"
                  value={content.kontak.namaSekolah}
                  onChange={(e) => updateKontak('namaSekolah', e.target.value)}
                  placeholder="SMP YAPIA CIPUTAT"
                />
              </div>

              <div>
                <InputField
                  label="Status Akreditasi"
                  value={content.kontak.akreditasi}
                  onChange={(e) => updateKontak('akreditasi', e.target.value)}
                  placeholder="Akreditasi A"
                />
              </div>

              <div>
                <InputField
                  label="Nomor Pokok Sekolah Nasional (NPSN)"
                  value={content.kontak.npsn}
                  onChange={(e) => updateKontak('npsn', e.target.value)}
                  placeholder="20603210"
                />
              </div>

              <div>
                <InputField
                  label="Nomor WhatsApp Hotline PPDB"
                  value={content.kontak.whatsapp}
                  onChange={(e) => updateKontak('whatsapp', e.target.value)}
                  placeholder="0812-3456-7890"
                />
              </div>

              <div>
                <InputField
                  label="Nomor Telepon Kantor"
                  value={content.kontak.telepon}
                  onChange={(e) => updateKontak('telepon', e.target.value)}
                  placeholder="(021) 749-XXXX"
                />
              </div>

              <div>
                <InputField
                  label="Alamat Email Resmi PPDB"
                  value={content.kontak.email}
                  onChange={(e) => updateKontak('email', e.target.value)}
                  placeholder="ppdb@smp-yapia.sch.id"
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Alamat Lengkap Sekolah"
                  value={content.kontak.alamatSekolah}
                  onChange={(e) => updateKontak('alamatSekolah', e.target.value)}
                  placeholder="Jl. KH. Dewantara No. 12, Ciputat, Kota Tangerang Selatan, Banten 15411"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Visi / Deskripsi Singkat Sekolah
                </label>
                <textarea
                  rows={2}
                  value={content.kontak.deskripsiSekolah}
                  onChange={(e) => updateKontak('deskripsiSekolah', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                  placeholder="Membentuk generasi berakhlak mulia..."
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Jadwal Pelayanan Panitia PPDB (Offline)"
                  value={content.kontak.jadwalPelayanan}
                  onChange={(e) => updateKontak('jadwalPelayanan', e.target.value)}
                  placeholder="Senin – Jumat: 08.00 – 15.00 WIB | Sabtu: 08.00 – 12.00 WIB"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Perubahan langsung tersimpan ke database dan tampil bagi seluruh pengunjung beranda.
          </p>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 shadow-md"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" /> Simpan Semua Perubahan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
