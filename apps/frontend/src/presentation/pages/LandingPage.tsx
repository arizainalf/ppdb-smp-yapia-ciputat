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
  metrics: [
    { title: 'Akreditasi A', subtitle: 'Kemendikbudristek' },
    { title: '100% Online', subtitle: 'Tanpa Antre di Sekolah' },
    { title: '24 Jam', subtitle: 'Akses Formulir Kapanpun' },
    { title: 'WhatsApp Notif', subtitle: 'Update Status Realtime' },
  ],
  syarat: {
    syaratBadge: 'Persyaratan PPDB',
    syaratTitle: 'Dokumen Persyaratan yang Perlu Disiapkan',
    syaratSubtitle: 'Pastikan Anda telah menyiapkan foto atau scan berkas dokumen berikut sebelum mengisi formulir:',
    items: [
      {
        title: 'Ijazah SD / Surat Keterangan Lulus (SKL)',
        desc: 'Scan asli atau fotokopi legalisir yang memuat nama siswa dan NISN yang jelas.',
      },
      {
        title: 'Kartu Keluarga (KK)',
        desc: 'Scan Kartu Keluarga yang mencantumkan nama orang tua/wali serta Nomor Induk Kependudukan (NIK).',
      },
      {
        title: 'Akta Kelahiran Calon Siswa',
        desc: 'Scan Akta Kelahiran resmi dari Dukcapil untuk verifikasi tanggal lahir dan usia anak.',
      },
    ],
  },
  panduan: {
    panduanBadge: 'Panduan Pendaftaran',
    panduanTitle: '4 Langkah Mudah Pendaftaran Online',
    steps: [
      {
        title: 'Isi Biodata Lengkap',
        desc: 'Isi data calon siswa, riwayat SD asal, alamat domisili, dan data orang tua/wali.',
      },
      {
        title: 'Unggah Scan Dokumen',
        desc: 'Upload dokumen Ijazah/SKL, KK, dan Akta Kelahiran langsung dari ponsel/laptop.',
      },
      {
        title: 'Verifikasi Panitia',
        desc: 'Panitia PPDB memverifikasi keabsahan berkas Anda dalam waktu 1x24 jam kerja.',
      },
      {
        title: 'Cetak Bukti Pendaftaran',
        desc: 'Dapatkan lembar bukti pendaftaran ber-QR Code untuk registrasi ulang di sekolah.',
      },
    ],
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
  potonganBiaya?: number;
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
  const [pendaftaranAktif, setPendaftaranAktif] = useState(true);
  // Kolom dinamis mengikuti jumlah item CMS: <=4 = 1 baris penuh; >=5 = 3 kolom (3+2, 3+3, ...)
  const metricsCols =
    siteContent.metrics.length <= 1
      ? 'md:grid-cols-1'
      : siteContent.metrics.length === 2
        ? 'md:grid-cols-2'
        : siteContent.metrics.length === 4
          ? 'md:grid-cols-4'
          : 'md:grid-cols-3';
  const syaratCols =
    siteContent.syarat.items.length <= 1
      ? 'sm:grid-cols-1'
      : siteContent.syarat.items.length === 2
        ? 'sm:grid-cols-2'
        : siteContent.syarat.items.length === 4
          ? 'sm:grid-cols-4'
          : 'sm:grid-cols-3';
  const panduanCols =
    siteContent.panduan.steps.length <= 1
      ? 'lg:grid-cols-1'
      : siteContent.panduan.steps.length === 2
        ? 'lg:grid-cols-2'
        : siteContent.panduan.steps.length === 4
          ? 'lg:grid-cols-4'
          : 'lg:grid-cols-3';
  // Column spanning: saat >=5 item (grid dasar 6 kolom), item baris terakhir
  // menyebar rata kiri-kanan (2 item -> span 3+3, 1 item -> span 6).
  // Catatan: class ditulis literal agar Tailwind JIT mendeteksinya.
  const edgeSpan = (i: number, n: number, p: 'sm' | 'md' | 'lg') => {
    const lastStart = n - (n % 3 === 0 ? 3 : n % 3);
    if (i < lastStart) return p === 'sm' ? 'sm:col-span-2' : p === 'md' ? 'md:col-span-2' : 'lg:col-span-2';
    if (n - lastStart === 1) return p === 'sm' ? 'sm:col-span-6' : p === 'md' ? 'md:col-span-6' : 'lg:col-span-6';
    return p === 'sm' ? 'sm:col-span-3' : p === 'md' ? 'md:col-span-3' : 'lg:col-span-3';
  };
  const [gelombangList, setGelombangList] = useState<GelombangItem[]>([
    {
      id: 1,
      namaGelombang: 'Gelombang 1 (1 Januari - 30 April)',
      tahunAjaran: '2027/2028',
      tanggalBuka: '2027-01-01',
      tanggalTutup: '2027-04-30',
      kuotaMaksimal: 120,
      kuotaTerisi: 7,
      biayaPendaftaran: 2000000,
      potonganBiaya: 800000,
      isActive: true,
    },
    {
      id: 2,
      namaGelombang: 'Gelombang 2 (1 Mei - 31 Juli)',
      tahunAjaran: '2027/2028',
      tanggalBuka: '2027-05-01',
      tanggalTutup: '2027-07-31',
      kuotaMaksimal: 60,
      kuotaTerisi: 0,
      biayaPendaftaran: 2000000,
      potonganBiaya: 200000,
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

    // 3. Status pendaftaran (saklar global panitia)
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/pengaturan`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && json.data) {
          setPendaftaranAktif(Boolean(json.data.pendaftaranAktif));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-10 sm:pt-16 pb-14 sm:pb-20 px-4">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_50%)]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {siteContent.hero.badgeText}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {siteContent.hero.heroTitle}
          </h1>

          <p className="text-xs sm:text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto font-normal leading-relaxed px-2">
            {siteContent.hero.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 sm:pt-4 w-full max-w-md sm:max-w-none mx-auto">
            <Button
              onClick={onStartRegistration}
              disabled={!pendaftaranAktif}
              className={`w-full sm:w-auto px-6 py-3.5 text-base font-black shadow-lg transition-all ${
                pendaftaranAktif
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-slate-600 text-slate-300 cursor-not-allowed shadow-none'
              }`}>
              {pendaftaranAktif ? (
                <>{siteContent.hero.heroDaftarBtn} <ArrowRight className="w-5 h-5 ml-1" /></>
              ) : (
                'Pendaftaran Ditutup'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCheckStatus}
              className="w-full sm:w-auto px-6 py-3.5 text-base bg-transparent hover:bg-emerald-500/20 text-emerald-100 hover:text-white border border-emerald-400/40 hover:border-emerald-400/70 font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-colors"
            >
              {siteContent.hero.heroCekStatusBtn}
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className={`grid grid-cols-2 ${siteContent.metrics.length >= 5 ? 'md:grid-cols-6' : metricsCols} gap-3 pt-10 border-t border-emerald-700/40 max-w-4xl mx-auto text-left`}>
            {siteContent.metrics.map((m, i) => (
              <div
                key={i}
                className={`p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30 ${
                  siteContent.metrics.length >= 5 ? edgeSpan(i, siteContent.metrics.length, 'md') : ''
                }`}>

                <span className="text-emerald-400 font-extrabold text-xl">{m.title}</span>
                <p className="text-[11px] text-emerald-200/70">{m.subtitle}</p>
              </div>
            ))}
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
                }`}>
                <span
                  className={`absolute top-0 right-0 font-extrabold text-[10px] px-3 py-1 rounded-bl-xl tracking-wider uppercase ${
                    g.isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                  {g.isActive ? 'Sedang Dibuka' : 'Ditutup / Segera'}
                </span>
                <div>
                  <div
                    className={`flex items-center gap-2 font-extrabold text-lg ${
                      g.isActive ? 'text-emerald-700' : 'text-slate-800'
                    }`}>
                    {g.isActive ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5 text-slate-400" />}
                    {g.namaGelombang}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Jadwal: {g.tanggalBuka} s/d {g.tanggalTutup}
                  </p>

                  <div className="mt-4 p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600 shrink-0" /> Sisa Kuota Kelas:
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
                    <div className="pt-1 border-t border-emerald-200/40 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Biaya Pendaftaran:</span>
                        {(g.potonganBiaya || 0) > 0 ? (
                          <span className="text-right">
                            <span className="block text-[11px] text-slate-400 line-through">
                              Rp {g.biayaPendaftaran.toLocaleString('id-ID')}
                            </span>
                            <span className="font-extrabold text-slate-900 block">
                              Rp {(Math.max(0, g.biayaPendaftaran - (g.potonganBiaya || 0))).toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700">
                              Hemat Rp {(g.potonganBiaya || 0).toLocaleString('id-ID')}
                            </span>
                          </span>
                        ) : (
                          <span className="font-extrabold text-slate-900">
                            Rp {g.biayaPendaftaran.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-relaxed">
                        Domisili Kota Tangerang Selatan mendapat bantuan biaya pendidikan dari Pemkot
                        sebesar Rp 1.800.000/tahun yang dipotong langsung dari tagihan.
                      </p>
                    </div>
                  </div>
                </div>

                {g.isActive ? (
                  pendaftaranAktif ? (
                    <Button onClick={onStartRegistration} className="mt-6 w-full">
                      Daftar Sekarang &rarr;
                    </Button>
                  ) : (
                    <Button disabled className="mt-6 w-full opacity-60">
                      Pendaftaran Ditutup
                    </Button>
                  )
                ) : (
                  <Button variant="secondary" disabled className="mt-6 w-full opacity-60">
                    Jadwal Belum Dibuka
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Informasi keringanan biaya bagi calon pendaftar */}
        <div className="mt-8 p-6 rounded-2xl bg-white border-2 border-emerald-100 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Bantuan & Keringanan Biaya Pendidikan
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Bantuan Pemkot Tangsel
              </p>
              <p className="text-slate-600 leading-relaxed">
                Bantuan biaya pendidikan dari Pemerintah Kota Tangerang Selatan sebesar
                Rp 1.800.000/tahun ajaran bagi pendaftar berdomisili di Tangsel. Dipotong langsung
                dari tagihan biaya pendaftaran.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Potongan SPP Anak Yatim
              </p>
              <p className="text-slate-600 leading-relaxed">
                Potongan SPP sebesar Rp 50.000/bulan untuk anak yatim. Diberlakukan setelah calon
                siswa resmi menjadi siswa, bukan saat mendaftar.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Beasiswa Ranking
              </p>
              <p className="text-slate-600 leading-relaxed">
                Beasiswa berdasarkan ranking hasil belajar: Peringkat 1 mendapat 3 bulan SPP,
                Peringkat 2 mendapat 2 bulan SPP, dan Peringkat 3 mendapat 1 bulan SPP.
                Berlaku setelah resmi menjadi siswa.
              </p>
            </div>
          </div>
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

          <div className={`grid grid-cols-1 ${siteContent.syarat.items.length >= 5 ? 'sm:grid-cols-6' : syaratCols} gap-4`}>
            {siteContent.syarat.items.map((s, i) => (
              <div
                key={i}
                className={`p-5 bg-white rounded-xl border border-slate-200 shadow-2xs ${
                  siteContent.syarat.items.length >= 5 ? edgeSpan(i, siteContent.syarat.items.length, 'sm') : ''
                }`}>

                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
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

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${siteContent.panduan.steps.length >= 5 ? 'lg:grid-cols-6' : panduanCols} gap-6`}>
          {siteContent.panduan.steps.map((step, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center p-4 ${
                siteContent.panduan.steps.length >= 5 ? edgeSpan(i, siteContent.panduan.steps.length, 'lg') : ''
              }`}>

              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
                {i + 1}
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION (CTA) HERO BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 md:p-12 shadow-2xl border border-emerald-700/60">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{siteContent.cta.ctaBadge}</span>
            </div>

            <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {siteContent.cta.ctaTitle}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
              {siteContent.cta.ctaSubtitle}
            </p>

            {/* High-Impact CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Button
                onClick={onStartRegistration}
                disabled={!pendaftaranAktif}
                className={`w-full sm:w-auto px-8 py-4 font-black text-base rounded-2xl transition-all flex items-center justify-center gap-2.5 ${
                  pendaftaranAktif
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-xl shadow-emerald-950/50 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-emerald-400/20'
                    : 'bg-slate-600 text-slate-300 shadow-xl shadow-emerald-950/50 cursor-not-allowed ring-4 ring-slate-500/20'
                }`}>
                <span>{pendaftaranAktif ? siteContent.cta.ctaPrimaryBtn : 'Pendaftaran Ditutup'}</span>
                {pendaftaranAktif && <ArrowRight className="w-5 h-5 shrink-0" />}
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
