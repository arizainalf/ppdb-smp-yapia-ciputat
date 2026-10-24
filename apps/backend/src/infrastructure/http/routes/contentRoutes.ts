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

interface SiteContentRow {
  key: string;
  value: string;
  updated_at: string;
  updated_by?: string | null;
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
      const parsed = JSON.parse(row.value) as Partial<LandingContentDTO>;

      // Deep merge with DEFAULT_LANDING_CONTENT to ensure no missing keys
      const merged: LandingContentDTO = {
        hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(parsed.hero || {}) },
        metrics: { ...DEFAULT_LANDING_CONTENT.metrics, ...(parsed.metrics || {}) },
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
      const cleanContent: LandingContentDTO = {
        hero: { ...DEFAULT_LANDING_CONTENT.hero, ...(content.hero || {}) },
        metrics: { ...DEFAULT_LANDING_CONTENT.metrics, ...(content.metrics || {}) },
        syarat: { ...DEFAULT_LANDING_CONTENT.syarat, ...(content.syarat || {}) },
        panduan: { ...DEFAULT_LANDING_CONTENT.panduan, ...(content.panduan || {}) },
        cta: { ...DEFAULT_LANDING_CONTENT.cta, ...(content.cta || {}) },
        kontak: { ...DEFAULT_LANDING_CONTENT.kontak, ...(content.kontak || {}) },
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
