import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
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

interface GelombangItem {
  id: number;
  namaGelombang: string;
  tahunAjaran: string;
  tanggalBuka: string;
  tanggalTutup: string;
  kuotaMaksimal: number;
  kuotaTerisi: number;
  biayaPendaftaran: number;
  isActive: boolean;
}

interface LandingPageProps {
  onStartRegistration: () => void;
  onCheckStatus: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRegistration,
  onCheckStatus,
}) => {
  const [siteContent, setSiteContent] = useState<LandingContentDTO>(DEFAULT_CONTENT);
  const [gelombangList, setGelombangList] = useState<GelombangItem[]>([
    {
      id: 1,
      namaGelombang: 'Gelombang 1 (Reguler & Afirmasi)',
      tahunAjaran: '2026/2027',
      tanggalBuka: '2026-10-01',
      tanggalTutup: '2026-12-31',
      kuotaMaksimal: 120,
      kuotaTerisi: 7,
      biayaPendaftaran: 250000,
      isActive: true,
    },
    {
      id: 2,
      namaGelombang: 'Gelombang 2 (Reguler Lanjutan)',
      tahunAjaran: '2026/2027',
      tanggalBuka: '2027-01-02',
      tanggalTutup: '2027-03-31',
      kuotaMaksimal: 60,
      kuotaTerisi: 0,
      biayaPendaftaran: 250000,
      isActive: false,
    },
  ]);

  useEffect(() => {
    // 1. Ambil data jadwal gelombang
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/gelombang`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          setGelombangList(json.data);
        }
      })
      .catch((err) => console.error('Gagal mengambil jadwal gelombang:', err));

    // 2. Ambil data konten dinamis beranda (CMS Super Admin)
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/content/landing`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && json.data) {
          setSiteContent(json.data);
        }
      })
      .catch((err) => console.error('Gagal mengambil konten dinamis beranda:', err));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-16 pb-20 px-4">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {siteContent.hero.badgeText}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {siteContent.hero.heroTitle}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto font-normal leading-relaxed">
            {siteContent.hero.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              onClick={onStartRegistration}
              className="w-full sm:w-auto px-6 py-3.5 text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              {siteContent.hero.heroDaftarBtn} <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={onCheckStatus}
              className="w-full sm:w-auto px-6 py-3.5 text-base bg-emerald-400 text-slate-800 hover:bg-emerald-800 border border-emerald-400 hover:text-white font-bold shadow-md shadow-emerald-400/20 hover:shadow-emerald-800/30"
            >
              {siteContent.hero.heroCekStatusBtn}
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 border-t border-emerald-700/40 max-w-4xl mx-auto text-left">
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">{siteContent.metrics.metric1Title}</span>
              <p className="text-[11px] text-emerald-200/70">{siteContent.metrics.metric1Subtitle}</p>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">{siteContent.metrics.metric2Title}</span>
              <p className="text-[11px] text-emerald-200/70">{siteContent.metrics.metric2Subtitle}</p>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">{siteContent.metrics.metric3Title}</span>
              <p className="text-[11px] text-emerald-200/70">{siteContent.metrics.metric3Subtitle}</p>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">{siteContent.metrics.metric4Title}</span>
              <p className="text-[11px] text-emerald-200/70">{siteContent.metrics.metric4Subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JADWAL GELOMBANG AKTIF */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Jadwal Admisi
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Gelombang Pendaftaran 2026
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pilih gelombang pendaftaran yang sedang aktif untuk mengamankan kuota siswa baru.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gelombangList.map((g) => {
            const sisa = Math.max(0, g.kuotaMaksimal - g.kuotaTerisi);
            const persenTerisi = Math.min(100, Math.round((g.kuotaTerisi / g.kuotaMaksimal) * 100));

            return (
              <div
                key={g.id}
                className={`p-6 rounded-2xl bg-white border-2 flex flex-col justify-between relative overflow-hidden transition-all ${
                  g.isActive
                    ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <span
                  className={`absolute top-0 right-0 font-extrabold text-[10px] px-3 py-1 rounded-bl-xl tracking-wider uppercase ${
                    g.isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {g.isActive ? 'Sedang Dibuka' : 'Ditutup / Segera'}
                </span>
                <div>
                  <div
                    className={`flex items-center gap-2 font-extrabold text-lg ${
                      g.isActive ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {g.isActive ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5 text-slate-400" />}
                    {g.namaGelombang}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Jadwal: {g.tanggalBuka} s/d {g.tanggalTutup}
                  </p>

                  <div className="mt-4 p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" /> Sisa Kuota Kelas:
                      </span>
                      <span className="font-bold text-emerald-900">
                        {sisa} dari {g.kuotaMaksimal} Siswa ({g.kuotaTerisi} Terdaftar)
                      </span>
                    </div>
                    <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-500"
                        style={{ width: `${persenTerisi}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-emerald-200/40">
                      <span className="text-slate-600">Biaya Formulir:</span>
                      <span className="font-extrabold text-slate-900">
                        Rp {g.biayaPendaftaran.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {g.isActive ? (
                  <Button onClick={onStartRegistration} className="mt-6 w-full">
                    Daftar Sekarang &rarr;
                  </Button>
                ) : (
                  <Button variant="secondary" disabled className="mt-6 w-full opacity-60">
                    Jadwal Belum Dibuka
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SYARAT & BERKAS DOKUMEN */}
      <section className="bg-slate-100/70 py-12 px-4 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              {siteContent.syarat.syaratBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {siteContent.syarat.syaratTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {siteContent.syarat.syaratSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{siteContent.syarat.syarat1Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {siteContent.syarat.syarat1Desc}
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{siteContent.syarat.syarat2Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {siteContent.syarat.syarat2Desc}
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{siteContent.syarat.syarat3Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {siteContent.syarat.syarat3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALUR PENDAFTARAN (4 LANGKAH) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            {siteContent.panduan.panduanBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {siteContent.panduan.panduanTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{siteContent.panduan.step1Title}</h4>
            <p className="text-xs text-slate-500">
              {siteContent.panduan.step1Desc}
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{siteContent.panduan.step2Title}</h4>
            <p className="text-xs text-slate-500">
              {siteContent.panduan.step2Desc}
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{siteContent.panduan.step3Title}</h4>
            <p className="text-xs text-slate-500">
              {siteContent.panduan.step3Desc}
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              4
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{siteContent.panduan.step4Title}</h4>
            <p className="text-xs text-slate-500">
              {siteContent.panduan.step4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION (CTA) HERO BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-emerald-700/60">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{siteContent.cta.ctaBadge}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {siteContent.cta.ctaTitle}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
              {siteContent.cta.ctaSubtitle}
            </p>

            {/* High-Impact CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Button
                onClick={onStartRegistration}
                className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-4 ring-emerald-400/20"
              >
                <span>{siteContent.cta.ctaPrimaryBtn}</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Button>

              <Button
                variant="outline"
                onClick={onCheckStatus}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-sm rounded-2xl backdrop-blur-xs transition-colors cursor-pointer"
              >
                {siteContent.cta.ctaSecondaryBtn}
              </Button>
            </div>

            {/* Value Reassurance Chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 text-[11px] text-emerald-200/80 border-t border-emerald-800/40">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {siteContent.cta.ctaChip1}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {siteContent.cta.ctaChip2}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {siteContent.cta.ctaChip3}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
