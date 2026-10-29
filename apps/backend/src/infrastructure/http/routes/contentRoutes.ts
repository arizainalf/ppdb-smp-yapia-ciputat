import { Hono } from 'hono';
import { d1Client } from '../../database/d1Client.js';
import { JSendPresenter } from '../../../interface-adapters/presenters/JSendPresenter.js';
import type { LandingContentDTO } from '@yapia/shared';

export const DEFAULT_LANDING_CONTENT: LandingContentDTO = {
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

interface SiteContentRow {
  key: string;
  value: string;
  updated_at: string;
  updated_by?: string | null;
}

type PartialLanding = Partial<LandingContentDTO>;

// Konversi blob format lama (metric1Title / syarat1Title / step1Title) ke format array.
// ponytail: hapus helper ini jika yakin tidak ada lagi data lama di DB produksi.
function normalizeLegacyLanding(parsed: Record<string, unknown>): PartialLanding {
  const p = parsed as any;
  const out: PartialLanding = { ...p };

  if (!Array.isArray(p.metrics) && p.metrics && typeof p.metrics === 'object') {
    out.metrics = [1, 2, 3, 4]
      .map((i) => ({ title: p.metrics[`metric${i}Title`], subtitle: p.metrics[`metric${i}Subtitle`] }))
      .filter((m) => m.title);
  }
  if (p.syarat && !Array.isArray(p.syarat.items) && typeof p.syarat === 'object') {
    out.syarat = {
      ...p.syarat,
      items: [1, 2, 3]
        .map((i) => ({ title: p.syarat[`syarat${i}Title`], desc: p.syarat[`syarat${i}Desc`] }))
        .filter((s) => s.title),
    };
  }
  if (p.panduan && !Array.isArray(p.panduan.steps) && typeof p.panduan === 'object') {
    out.panduan = {
      ...p.panduan,
      steps: [1, 2, 3, 4]
        .map((i) => ({ title: p.panduan[`step${i}Title`], desc: p.panduan[`step${i}Desc`] }))
        .filter((s) => s.title),
    };
  }
  return out;
}

export function createContentRouter(): Hono {
  const router = new Hono();

  // 1. GET LANDING CONTENT (Public)
  router.get('/landing', async (c) => {
    try {
      const res = await d1Client.query<SiteContentRow>(
        'SELECT * FROM site_content WHERE key = ? LIMIT 1',
        ['landing_page']
      );

      if (!res.results || res.results.length === 0) {
        return c.json(
          JSendPresenter.success(DEFAULT_LANDING_CONTENT, 'Default landing content loaded'),
          200
        );
      }

      const row = res.results[0];
      const parsed = normalizeLegacyLanding(JSON.parse(row.value));

      // Deep merge with DEFAULT_LANDING_CONTENT to ensure no missing keys
      const merged: LandingContentDTO = {
        hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(parsed.hero || {}) },
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : DEFAULT_LANDING_CONTENT.metrics,
        syarat: { ...DEFAULT_LANDING_CONTENT.syarat, ...(parsed.syarat || {}) },
        panduan: { ...DEFAULT_LANDING_CONTENT.panduan, ...(parsed.panduan || {}) },
        cta: { ...DEFAULT_LANDING_CONTENT.cta, ...(parsed.cta || {}) },
        kontak: { ...DEFAULT_LANDING_CONTENT.kontak, ...(parsed.kontak || {}) },
        updatedAt: row.updated_at,
        updatedBy: row.updated_by || undefined,
      };

      return c.json(
        JSendPresenter.success(merged, 'Landing page content successfully retrieved'),
        200
      );
    } catch (err: any) {
      console.error('Error fetching landing content:', err);
      // Failover safely to default
      return c.json(
        JSendPresenter.success(DEFAULT_LANDING_CONTENT, 'Fallback to default landing content'),
        200
      );
    }
  });

  // 2. UPDATE LANDING CONTENT (Admin Protected)
  router.put('/landing', async (c) => {
    try {
      const body = await c.req.json();
      const updatedBy = body.updatedBy || 'Super Admin';
      const content = body.content || body;

      // Validate required sections
      if (!content || typeof content !== 'object') {
        return c.json(JSendPresenter.fail('Payload konten beranda tidak valid'), 400);
      }

      // Merge incoming with default to guarantee completeness
      const incoming = normalizeLegacyLanding(content);
      const cleanContent: LandingContentDTO = {
        hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(incoming.hero || {}) },
        metrics: Array.isArray(incoming.metrics) ? incoming.metrics : DEFAULT_LANDING_CONTENT.metrics,
        syarat: { ...DEFAULT_LANDING_CONTENT.syarat, ...(incoming.syarat || {}) },
        panduan: { ...DEFAULT_LANDING_CONTENT.panduan, ...(incoming.panduan || {}) },
        cta: { ...DEFAULT_LANDING_CONTENT.cta, ...(incoming.cta || {}) },
        kontak: { ...DEFAULT_LANDING_CONTENT.kontak, ...(incoming.kontak || {}) },
      };

      const jsonStr = JSON.stringify(cleanContent);
      const nowIso = new Date().toISOString();

      await d1Client.query(
        `INSERT INTO site_content (key, value, updated_at, updated_by)
         VALUES ('landing_page', ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`,
        [jsonStr, nowIso, updatedBy]
      );

      return c.json(
        JSendPresenter.success(
          { ...cleanContent, updatedAt: nowIso, updatedBy },
          'Konten beranda berhasil diperbarui dan dipublikasikan'
        ),
        200
      );
    } catch (err: any) {
      console.error('Error updating landing content:', err);
      return c.json(
        JSendPresenter.error(err.message || 'Gagal menyimpan konten beranda'),
        500
      );
    }
  });

  // 3. RESET TO DEFAULT (Admin Protected)
  router.post('/landing/reset', async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const updatedBy = body.updatedBy || 'Super Admin (Reset)';
      const nowIso = new Date().toISOString();
      const jsonStr = JSON.stringify(DEFAULT_LANDING_CONTENT);

      await d1Client.query(
        `INSERT INTO site_content (key, value, updated_at, updated_by)
         VALUES ('landing_page', ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updated_at = excluded.updated_at,
           updated_by = excluded.updated_by`,
        [jsonStr, nowIso, updatedBy]
      );

      return c.json(
        JSendPresenter.success(
          { ...DEFAULT_LANDING_CONTENT, updatedAt: nowIso, updatedBy },
          'Konten beranda berhasil direset ke pengaturan bawaan'
        ),
        200
      );
    } catch (err: any) {
      console.error('Error resetting landing content:', err);
      return c.json(JSendPresenter.error('Gagal mereset konten beranda'), 500);
    }
  });

  return router;
}
