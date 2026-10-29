import { Hono } from 'hono';
import { d1Client } from '../../database/d1Client.js';
import { JSendPresenter } from '../../../interface-adapters/presenters/JSendPresenter.js';
import { requireAuth, requirePermission } from '../middlewares/authMiddleware.js';

export const PENGATURAN_KEYS = {
  pendaftaranAktif: 'pendaftaran_aktif', // '1' | '0'
  tahunAjaran: 'tahun_ajaran',           // mis. '2026/2027'
} as const;

const DEFAULTS: Record<string, string> = {
  [PENGATURAN_KEYS.pendaftaranAktif]: '1',
  [PENGATURAN_KEYS.tahunAjaran]: '2026/2027',
};

export async function getPengaturanMap(): Promise<Record<string, string>> {
  const res = await d1Client.query<{ key: string; value: string }>(
    `SELECT key, value FROM site_content WHERE key IN (?, ?)`,
    [PENGATURAN_KEYS.pendaftaranAktif, PENGATURAN_KEYS.tahunAjaran]
  );
  const map: Record<string, string> = { ...DEFAULTS };
  for (const row of res.results) {
    map[row.key] = row.value;
  }
  return map;
}

// Info sekolah & kontak disimpan di seksi `kontak` pada JSON landing_page
// (sumber data tunggal untuk footer beranda), dikelola lewat halaman Pengaturan PPDB.
async function getKontakSekolah(): Promise<Record<string, string>> {
  const res = await d1Client.query<{ value: string }>(
    'SELECT value FROM site_content WHERE key = ? LIMIT 1',
    ['landing_page']
  );
  try {
    const parsed = JSON.parse(res.results[0]?.value || '{}');
    return parsed.kontak || {};
  } catch {
    return {};
  }
}

async function saveKontakSekolah(kontak: Record<string, unknown>): Promise<void> {
  const res = await d1Client.query<{ value: string }>(
    'SELECT value FROM site_content WHERE key = ? LIMIT 1',
    ['landing_page']
  );
  let landing: any = {};
  try {
    landing = JSON.parse(res.results[0]?.value || '{}');
  } catch {}
  landing.kontak = { ...(landing.kontak || {}), ...kontak };

  await d1Client.query(
    `INSERT INTO site_content (key, value, updated_by) VALUES ('landing_page', ?, 'Pengaturan PPDB')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), updated_by = excluded.updated_by`,
    [JSON.stringify(landing)]
  );
}

export function createPengaturanRouter(): Hono {
  const router = new Hono();

  // 1. GET publik — dipakai wizard, beranda, dan gate pendaftaran
  router.get('/', async (c) => {
    try {
      const map = await getPengaturanMap();
      const kontak = await getKontakSekolah();
      return c.json(
        JSendPresenter.success({
          pendaftaranAktif: map[PENGATURAN_KEYS.pendaftaranAktif] === '1',
          tahunAjaran: map[PENGATURAN_KEYS.tahunAjaran],
          kontak,
        })
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengambil pengaturan'), 500);
    }
  });

  // 2. PUT admin — simpan toggle & tahun ajaran
  router.put('/', requireAuth(), requirePermission('MANAGE_CONTENT'), async (c) => {
    try {
      const { pendaftaranAktif, tahunAjaran, kontak } = await c.req.json();

      if (typeof pendaftaranAktif === 'boolean') {
        await d1Client.query(
          `INSERT INTO site_content (key, value, updated_by) VALUES (?, ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), updated_by = excluded.updated_by`,
          [PENGATURAN_KEYS.pendaftaranAktif, pendaftaranAktif ? '1' : '0', 'Admin']
        );
      }

      if (typeof tahunAjaran === 'string' && tahunAjaran.trim()) {
        await d1Client.query(
          `INSERT INTO site_content (key, value, updated_by) VALUES (?, ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), updated_by = excluded.updated_by`,
          [PENGATURAN_KEYS.tahunAjaran, tahunAjaran.trim(), 'Admin']
        );
      }

      if (kontak && typeof kontak === 'object') {
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(kontak)) {
          if (typeof v === 'string') clean[k] = v;
        }
        await saveKontakSekolah(clean);
      }

      return c.json(JSendPresenter.success(null, 'Pengaturan berhasil disimpan'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menyimpan pengaturan'), 500);
    }
  });

  return router;
}
