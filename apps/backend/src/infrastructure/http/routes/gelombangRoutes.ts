import { Hono } from 'hono';
import { d1Client } from '../../database/d1Client.js';
import { JSendPresenter } from '../../../interface-adapters/presenters/JSendPresenter.js';

interface RawGelombang {
  id: number;
  nama_gelombang: string;
  tahun_ajaran: string;
  tanggal_buka: string;
  tanggal_tutup: string;
  kuota_maksimal: number;
  biaya_pendaftaran: number;
  is_active: number;
  created_at: string;
}

export function createGelombangRouter(): Hono {
  const router = new Hono();

  // 1. GET ALL GELOMBANG (termasuk hitungan kuota terisi secara real-time)
  router.get('/', async (c) => {
    try {
      const res = await d1Client.query<RawGelombang>(
        'SELECT * FROM gelombang_pendaftaran ORDER BY id ASC'
      );

      // Hitung kuota terisi per gelombang dari tabel calon_siswa
      const gelombangWithStats = await Promise.all(
        res.results.map(async (g) => {
          const countRes = await d1Client.query<{ total: number }>(
            'SELECT COUNT(*) as total FROM calon_siswa WHERE gelombang_id = ?',
            [g.id]
          );
          const terisi = countRes.results[0]?.total ?? 0;

          return {
            id: g.id,
            namaGelombang: g.nama_gelombang,
            tahunAjaran: g.tahun_ajaran,
            tanggalBuka: g.tanggal_buka,
            tanggalTutup: g.tanggal_tutup,
            kuotaMaksimal: g.kuota_maksimal,
            kuotaTerisi: terisi,
            biayaPendaftaran: g.biaya_pendaftaran,
            isActive: Boolean(g.is_active),
          };
        })
      );

      return c.json(
        JSendPresenter.success(gelombangWithStats, 'Data master gelombang berhasil diambil'),
        200
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengambil data gelombang'), 500);
    }
  });

  // 2. CREATE NEW GELOMBANG
  router.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const {
        namaGelombang,
        tahunAjaran,
        tanggalBuka,
        tanggalTutup,
        kuotaMaksimal,
        biayaPendaftaran,
        isActive,
      } = body;

      if (!namaGelombang || !tahunAjaran || !tanggalBuka || !tanggalTutup) {
        return c.json(JSendPresenter.fail('Nama, tahun ajaran, dan tanggal gelombang wajib diisi'), 400);
      }

      await d1Client.query(
        `INSERT INTO gelombang_pendaftaran (
          nama_gelombang, tahun_ajaran, tanggal_buka, tanggal_tutup,
          kuota_maksimal, biaya_pendaftaran, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          namaGelombang,
          tahunAjaran,
          tanggalBuka,
          tanggalTutup,
          Number(kuotaMaksimal) || 100,
          Number(biayaPendaftaran) || 250000,
          isActive ? 1 : 0,
        ]
      );

      return c.json(JSendPresenter.success(null, 'Gelombang baru berhasil ditambahkan'), 201);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menambahkan gelombang'), 500);
    }
  });

  // 3. UPDATE GELOMBANG
  router.put('/:id', async (c) => {
    try {
      const id = Number(c.req.param('id'));
      const body = await c.req.json();
      const {
        namaGelombang,
        tahunAjaran,
        tanggalBuka,
        tanggalTutup,
        kuotaMaksimal,
        biayaPendaftaran,
        isActive,
      } = body;

      await d1Client.query(
        `UPDATE gelombang_pendaftaran SET
          nama_gelombang = ?, tahun_ajaran = ?, tanggal_buka = ?, tanggal_tutup = ?,
          kuota_maksimal = ?, biaya_pendaftaran = ?, is_active = ?
        WHERE id = ?`,
        [
          namaGelombang,
          tahunAjaran,
          tanggalBuka,
          tanggalTutup,
          Number(kuotaMaksimal) || 100,
          Number(biayaPendaftaran) || 250000,
          isActive ? 1 : 0,
          id,
        ]
      );

      return c.json(JSendPresenter.success(null, 'Data gelombang berhasil diperbarui'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal memperbarui data gelombang'), 500);
    }
  });

  // 4. TOGGLE ACTIVE (ON/OFF)
  router.patch('/:id/toggle', async (c) => {
    try {
      const id = Number(c.req.param('id'));
      const check = await d1Client.query<{ is_active: number }>(
        'SELECT is_active FROM gelombang_pendaftaran WHERE id = ? LIMIT 1',
        [id]
      );

      if (check.results.length === 0) {
        return c.json(JSendPresenter.fail('Gelombang tidak ditemukan'), 404);
      }

      const currentStatus = check.results[0].is_active;
      const nextStatus = currentStatus === 1 ? 0 : 1;

      await d1Client.query(
        'UPDATE gelombang_pendaftaran SET is_active = ? WHERE id = ?',
        [nextStatus, id]
      );

      return c.json(
        JSendPresenter.success({ isActive: Boolean(nextStatus) }, 'Status aktif gelombang berhasil diubah'),
        200
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengubah status gelombang'), 500);
    }
  });

  // 5. DELETE GELOMBANG
  router.delete('/:id', async (c) => {
    try {
      const id = Number(c.req.param('id'));
      await d1Client.query('DELETE FROM gelombang_pendaftaran WHERE id = ?', [id]);
      return c.json(JSendPresenter.success(null, 'Gelombang berhasil dihapus'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menghapus gelombang'), 500);
    }
  });

  return router;
}
