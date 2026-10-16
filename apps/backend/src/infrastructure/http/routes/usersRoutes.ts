import { Hono } from 'hono';
import { d1Client } from '../../database/d1Client.js';
import { JSendPresenter } from '../../../interface-adapters/presenters/JSendPresenter.js';

interface RawUser {
  id: string;
  nama_lengkap: string;
  no_hp: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'BENDAHARA' | 'KEPSEK';
  is_active: number;
  created_at: string;
}

export function createUsersRouter(): Hono {
  const router = new Hono();

  // 1. GET ALL PANITIA USERS
  router.get('/', async (c) => {
    try {
      const res = await d1Client.query<RawUser>(
        'SELECT id, nama_lengkap, no_hp, email, role, is_active, created_at FROM users ORDER BY created_at ASC'
      );

      const users = res.results.map((u) => ({
        id: u.id,
        namaLengkap: u.nama_lengkap,
        noHp: u.no_hp,
        email: u.email,
        role: u.role,
        isActive: Boolean(u.is_active),
        createdAt: u.created_at,
      }));

      return c.json(JSendPresenter.success(users, 'Data panitia berhasil diambil'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengambil data panitia'), 500);
    }
  });

  // 2. CREATE NEW PANITIA USER
  router.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const { namaLengkap, noHp, email, role, isActive, password } = body;

      if (!namaLengkap || !noHp || !email || !role) {
        return c.json(JSendPresenter.fail('Nama lengkap, no HP, email, dan role wajib diisi'), 400);
      }

      const id = crypto.randomUUID();
      const passwordHash = password || 'password123';

      await d1Client.query(
        `INSERT INTO users (id, nama_lengkap, no_hp, email, password_hash, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, namaLengkap, noHp, email, passwordHash, role, isActive ? 1 : 0]
      );

      return c.json(JSendPresenter.success({ id }, 'Akun panitia baru berhasil ditambahkan'), 201);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menambahkan akun panitia'), 500);
    }
  });

  // 3. UPDATE PANITIA USER
  router.put('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const { namaLengkap, noHp, email, role, isActive } = body;

      await d1Client.query(
        `UPDATE users SET
          nama_lengkap = ?, no_hp = ?, email = ?, role = ?, is_active = ?,
          updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        WHERE id = ?`,
        [namaLengkap, noHp, email, role, isActive ? 1 : 0, id]
      );

      return c.json(JSendPresenter.success(null, 'Data akun panitia berhasil diperbarui'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal memperbarui data akun'), 500);
    }
  });

  // 4. TOGGLE ACTIVE (ON/OFF)
  router.patch('/:id/toggle', async (c) => {
    try {
      const id = c.req.param('id');
      const check = await d1Client.query<{ is_active: number }>(
        'SELECT is_active FROM users WHERE id = ? LIMIT 1',
        [id]
      );

      if (check.results.length === 0) {
        return c.json(JSendPresenter.fail('Akun panitia tidak ditemukan'), 404);
      }

      const nextStatus = check.results[0].is_active === 1 ? 0 : 1;

      await d1Client.query(
        `UPDATE users SET
          is_active = ?,
          updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        WHERE id = ?`,
        [nextStatus, id]
      );

      return c.json(
        JSendPresenter.success({ isActive: Boolean(nextStatus) }, 'Status akun panitia berhasil diubah'),
        200
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengubah status panitia'), 500);
    }
  });

  // 5. DELETE PANITIA USER
  router.delete('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      await d1Client.query('DELETE FROM users WHERE id = ?', [id]);
      return c.json(JSendPresenter.success(null, 'Akun panitia berhasil dihapus'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menghapus panitia'), 500);
    }
  });

  return router;
}
