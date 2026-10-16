import { Hono } from 'hono';
import { loginSchema } from '@yapia/shared';
import { d1Client } from '../../database/d1Client.js';

export function createAuthRouter(): Hono {
  const router = new Hono();

  // ============================================================================
  // 1. LOGIN KHUSUS PANITIA / STAF (Tabel: `users`)
  // Menggunakan Nomor HP / Email dan Kata Sandi (Password)
  // Murni dari Database D1 / SQLite lokal
  // ============================================================================
  router.post('/login', async (c) => {
    try {
      const body = await c.req.json();
      const validated = loginSchema.safeParse(body);

      if (!validated.success) {
        return c.json(
          {
            status: 'fail',
            message: 'Validasi login gagal',
            errors: validated.error.errors,
          },
          400
        );
      }

      const { noHp, password } = validated.data;
      const cleanPhone = String(noHp).replace(/[^0-9]/g, '');
      const inputStr = String(noHp).trim().toLowerCase();

      // Query langsung ke tabel `users` di database
      const d1Res = await d1Client.query<any>(
        `SELECT id, nama_lengkap, no_hp, email, password_hash, role, is_active
         FROM users
         WHERE (
           LOWER(TRIM(email)) = ?
           OR no_hp = ?
           OR (no_hp LIKE ? AND length(?) >= 8)
         )
         LIMIT 1`,
        [inputStr, noHp, `%${cleanPhone.slice(-8)}%`, cleanPhone]
      );

      if (d1Res.results.length === 0) {
        return c.json(
          {
            status: 'fail',
            message: 'Akun panitia tidak terdaftar di database. Silakan hubungi Administrator.',
          },
          404
        );
      }

      const userRow = d1Res.results[0];

      // Verifikasi status akun aktif/nonaktif
      if (userRow.is_active !== 1) {
        return c.json(
          {
            status: 'fail',
            message: 'Akun panitia Anda dinonaktifkan oleh Administrator.',
          },
          403
        );
      }

      // Verifikasi kata sandi dari database
      if (userRow.password_hash !== password) {
        return c.json(
          {
            status: 'fail',
            message: 'Kata sandi (password) salah. Silakan periksa kembali.',
          },
          401
        );
      }

      return c.json({
        status: 'success',
        message: 'Login panitia berhasil (Database).',
        data: {
          user: {
            id: userRow.id,
            namaLengkap: userRow.nama_lengkap,
            noHp: userRow.no_hp,
            email: userRow.email,
            role: userRow.role,
            isActive: Boolean(userRow.is_active),
          },
          token: `jwt-token-${userRow.id}-${Date.now()}`,
        },
      });
    } catch (err: any) {
      return c.json(
        {
          status: 'error',
          message: err.message || 'Terjadi kesalahan sistem saat memproses login panitia.',
        },
        500
      );
    }
  });

  // ============================================================================
  // 2. LOGIN KHUSUS ORANG TUA / PENDAFTAR (Tabel: `calon_siswa` + `orang_tua_wali`)
  // Menggunakan Nomor WhatsApp dan Email yang didaftarkan (Tanpa Password)
  // Murni dari Database D1 / SQLite lokal
  // ============================================================================
  router.post('/login-pendaftar', async (c) => {
    try {
      const body = await c.req.json();
      const { noHp, email } = body;

      if (!noHp || !email) {
        return c.json(
          {
            status: 'fail',
            message: 'Nomor WhatsApp dan Email orang tua wajib diisi.',
          },
          400
        );
      }

      const cleanPhone = String(noHp).replace(/[^0-9]/g, '');
      const cleanEmail = String(email).trim().toLowerCase();

      // Query database Cloudflare D1 (tabel `calon_siswa` & `orang_tua_wali`)
      const d1Res = await d1Client.query<any>(
        `SELECT cs.id, cs.nama_lengkap as nama_siswa, cs.nomor_pendaftaran, cs.email, otw.nama_lengkap as nama_ortu, otw.no_hp
         FROM calon_siswa cs
         LEFT JOIN orang_tua_wali otw ON cs.id = otw.calon_siswa_id
         WHERE (
           (otw.no_hp IS NOT NULL AND otw.no_hp LIKE ?)
           OR (cs.no_hp_siswa IS NOT NULL AND cs.no_hp_siswa LIKE ?)
         )
         AND LOWER(TRIM(cs.email)) = ?
         LIMIT 1`,
        [`%${cleanPhone.slice(-8)}%`, `%${cleanPhone.slice(-8)}%`, cleanEmail]
      );

      if (d1Res.results.length === 0) {
        return c.json(
          {
            status: 'fail',
            message: 'Data pendaftaran tidak ditemukan di database. Pastikan Nomor WhatsApp dan Email sesuai dengan data pendaftaran ananda.',
          },
          404
        );
      }

      const row = d1Res.results[0];
      return c.json({
        status: 'success',
        message: 'Login orang tua berhasil (Database).',
        data: {
          user: {
            id: `usr-parent-${row.id}`,
            namaLengkap: `${row.nama_ortu || 'Wali Murid'} (Orang Tua ${row.nama_siswa})`,
            noHp: row.no_hp || noHp,
            email: row.email,
            role: 'PENDAFTAR',
            isActive: true,
          },
          token: `jwt-token-pendaftar-${row.id}-${Date.now()}`,
        },
      });
    } catch (err: any) {
      return c.json(
        {
          status: 'error',
          message: err.message || 'Terjadi kesalahan sistem saat memproses login pendaftar.',
        },
        500
      );
    }
  });

  return router;
}
