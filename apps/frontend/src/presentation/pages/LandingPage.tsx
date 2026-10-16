import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';

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
    fetch('http://localhost:8000/api/v1/gelombang')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          setGelombangList(json.data);
        }
      })
      .catch((err) => console.error('Gagal mengambil jadwal gelombang:', err));
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
            PENDAFTARAN RESMI DIBUKA: TAHUN AJARAN 2026/2027
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Mewujudkan Generasi Islami, <span className="text-emerald-400">Cerdas</span> & Berakhlak Mulia
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto font-normal leading-relaxed">
            Selamat datang di Portal Resmi Sistem Informasi Penerimaan Murid Baru (SIPMB) <strong>SMP YAPIA Ciputat</strong>. Proses pendaftaran mudah, transparan, dan terverifikasi secara online.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              onClick={onStartRegistration}
              className="w-full sm:w-auto px-6 py-3.5 text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Daftar Sekarang <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={onCheckStatus}
              className="w-full sm:w-auto px-6 py-3.5 text-base bg-emerald-400 text-slate-800 hover:bg-emerald-800 border border-emerald-400 hover:text-white font-bold shadow-md shadow-emerald-400/20 hover:shadow-emerald-800/30"
            >
              Cek Status Pendaftaran
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-10 border-t border-emerald-700/40 max-w-4xl mx-auto text-left">
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">Akreditasi A</span>
              <p className="text-[11px] text-emerald-200/70">Kemendikbudristek</p>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">100% Online</span>
              <p className="text-[11px] text-emerald-200/70">Tanpa Antre di Sekolah</p>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">24 Jam</span>
              <p className="text-[11px] text-emerald-200/70">Akses Formulir Kapanpun</p>
            </div>
            <div className="p-3 bg-emerald-800/30 rounded-xl border border-emerald-700/30">
              <span className="text-emerald-400 font-extrabold text-xl">WhatsApp Notif</span>
              <p className="text-[11px] text-emerald-200/70">Update Status Realtime</p>
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
              Persyaratan PPDB
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Dokumen Persyaratan yang Perlu Disiapkan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pastikan Anda telah menyiapkan foto atau scan berkas dokumen berikut sebelum mengisi formulir:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Ijazah SD / Surat Keterangan Lulus (SKL)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan asli atau fotokopi legalisir yang memuat nama siswa dan NISN yang jelas.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Kartu Keluarga (KK)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan Kartu Keluarga yang mencantumkan nama orang tua/wali serta Nomor Induk Kependudukan (NIK).
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Akta Kelahiran Calon Siswa</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan Akta Kelahiran resmi dari Dukcapil untuk verifikasi tanggal lahir dan usia anak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ALUR PENDAFTARAN (4 LANGKAH) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Panduan Pendaftaran
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            4 Langkah Mudah Pendaftaran Online
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Isi Biodata Lengkap</h4>
            <p className="text-xs text-slate-500">
              Isi data calon siswa, riwayat SD asal, alamat domisili, dan data orang tua/wali.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Unggah Scan Dokumen</h4>
            <p className="text-xs text-slate-500">
              Upload dokumen Ijazah/SKL, KK, dan Akta Kelahiran langsung dari ponsel/laptop.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Verifikasi Panitia</h4>
            <p className="text-xs text-slate-500">
              Panitia PPDB memverifikasi keabsahan berkas Anda dalam waktu 1x24 jam kerja.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-3 shadow-md shadow-emerald-600/20">
              4
            </div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Cetak Bukti Pendaftaran</h4>
            <p className="text-xs text-slate-500">
              Dapatkan lembar bukti pendaftaran ber-QR Code untuk registrasi ulang di sekolah.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onStartRegistration} className="px-8 py-3 text-base">
            Mulai Pengisian Formulir Sekarang &rarr;
          </Button>
        </div>
      </section>
    </div>
  );
};
