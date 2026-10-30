import { Hono } from 'hono';
import { loginSchema, changePasswordSchema } from '@yapia/shared';
import { d1Client } from '../../database/d1Client.js';
import { verifyPassword, hashPassword } from '../../crypto/password.js';
import { signJwt } from '../../crypto/jwt.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { Context } from 'hono';

function getJwtSecret(c: Context): string {
  const secret = ((c.env as any)?.JWT_SECRET as string | undefined) || process.env?.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️ [Auth] JWT_SECRET tidak diset — memakai secret development. WAJIB diset di produksi!');
    return 'sipmb-dev-secret-ganti-di-produksi';
  }
  return secret;
}

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

      // Verifikasi kata sandi (PBKDF2; data plaintext lama di-upgrade otomatis)
      const { ok, needsRehash } = await verifyPassword(password, userRow.password_hash);
      if (!ok) {
        return c.json(
          {
            status: 'fail',
            message: 'Kata sandi (password) salah. Silakan periksa kembali.',
          },
          401
        );
      }

      if (needsRehash) {
        try {
          const upgraded = await hashPassword(password);
          await d1Client.query(
            `UPDATE users SET password_hash = ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = ?`,
            [upgraded, userRow.id]
          );
        } catch {}
      }

      const token = await signJwt(
        { sub: userRow.id, role: userRow.role, nama: userRow.nama_lengkap },
        getJwtSecret(c)
      );

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
          token,
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
      const token = await signJwt(
        { sub: `usr-parent-${row.id}`, role: 'PENDAFTAR', nama: `${row.nama_ortu || 'Wali Murid'}` },
        getJwtSecret(c)
      );
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
          token,
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

  // ============================================================================
  // 3. LOGIN PANITIA VIA GOOGLE (Sign in with Google)
  // Email akun Google (terverifikasi) dicocokkan dengan tabel `users`
  // yang didaftarkan admin. Akun yang tidak terdaftar ditolak.
  // ============================================================================
  router.post('/google', async (c) => {
    try {
      const { credential } = await c.req.json();
      if (!credential) {
        return c.json(
          { status: 'fail', message: 'Credential Google wajib dikirim.' },
          400
        );
      }

      // Verifikasi ID Token ke Google (server-side)
      const gRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (!gRes.ok) {
        return c.json({ status: 'fail', message: 'Token Google tidak valid.' }, 401);
      }
      const g: any = await gRes.json();

      // Validasi klaim: token ditujukan untuk aplikasi ini & belum kadaluarsa
      const clientId =
        ((c.env as any)?.GOOGLE_CLIENT_ID as string | undefined) || process.env?.GOOGLE_CLIENT_ID;
      if (!clientId || g.aud !== clientId || Number(g.exp) * 1000 < Date.now()) {
        return c.json(
          { status: 'fail', message: 'Token Google tidak ditujukan untuk aplikasi ini.' },
          401
        );
      }
      if (g.email_verified !== 'true' && g.email_verified !== true) {
        return c.json({ status: 'fail', message: 'Email Google belum terverifikasi.' }, 401);
      }

      const email = String(g.email).trim().toLowerCase();
      const googleSub = String(g.sub);

      // Analisa: cocokkan dengan akun panitia yang didaftarkan admin
      const d1Res = await d1Client.query<any>(
        `SELECT id, nama_lengkap, no_hp, email, role, is_active, google_sub
         FROM users
         WHERE LOWER(TRIM(email)) = ?
         LIMIT 1`,
        [email]
      );

      if (d1Res.results.length === 0) {
        return c.json(
          {
            status: 'fail',
            message: 'Email Google Anda tidak terdaftar di database. Silakan hubungi Administrator.',
          },
          404
        );
      }

      const userRow = d1Res.results[0];

      // Verifikasi status akun aktif/nonaktif
      if (userRow.is_active !== 1) {
        return c.json(
          { status: 'fail', message: 'Akun panitia Anda dinonaktifkan oleh Administrator.' },
          403
        );
      }

      // Satu akun Google hanya boleh ter-link ke satu user
      if (userRow.google_sub && userRow.google_sub !== googleSub) {
        return c.json(
          { status: 'fail', message: 'Akun ini sudah terhubung dengan akun Google lain.' },
          401
        );
      }

      // Login pertama via Google: simpan google_sub (link permanen)
      if (!userRow.google_sub) {
        await d1Client.query(
          `UPDATE users SET google_sub = ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = ?`,
          [googleSub, userRow.id]
        );
      }

      const token = await signJwt(
        { sub: userRow.id, role: userRow.role, nama: userRow.nama_lengkap },
        getJwtSecret(c)
      );

      return c.json({
        status: 'success',
        message: 'Login panitia via Google berhasil.',
        data: {
          user: {
            id: userRow.id,
            namaLengkap: userRow.nama_lengkap,
            noHp: userRow.no_hp,
            email: userRow.email,
            role: userRow.role,
            isActive: Boolean(userRow.is_active),
          },
          token,
        },
      });
    } catch (err: any) {
      return c.json(
        {
          status: 'error',
          message: err.message || 'Terjadi kesalahan sistem saat login dengan Google.',
        },
        500
      );
    }
  });

  // ============================================================================
  // 4. UBAH KATA SANDI (panitia yang sudah login)
  // Identitas diambil dari klaim JWT (sub) — bukan dari body, agar pendaftar
  // hanya bisa mengubah kata sandi akunnya sendiri.
  // ============================================================================
  router.post('/change-password', requireAuth(), async (c) => {
    try {
      const body = await c.req.json();
      const validated = changePasswordSchema.safeParse(body);
      if (!validated.success) {
        return c.json(
          {
            status: 'fail',
            message: 'Validasi data gagal',
            errors: validated.error.errors,
          },
          400
        );
      }

      const role = ((c.get as (k: string) => unknown)('userRole') as string) || undefined;
      if (role === 'PENDAFTAR') {
        return c.json(
          { status: 'fail', message: 'Fitur ini hanya untuk akun panitia.' },
          403
        );
      }

      const userId = ((c.get as (k: string) => unknown)('userId') as string) || '';
      const { passwordLama, passwordBaru } = validated.data;

      const d1Res = await d1Client.query<any>(
        'SELECT id, password_hash, is_active FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      const userRow = d1Res.results[0];
      if (!userRow) {
        return c.json(
          { status: 'fail', message: 'Akun panitia tidak ditemukan di database.' },
          404
        );
      }
      if (userRow.is_active !== 1) {
        return c.json(
          { status: 'fail', message: 'Akun panitia Anda dinonaktifkan oleh Administrator.' },
          403
        );
      }

      // Verifikasi kata sandi lama sebelum mengganti
      const { ok } = await verifyPassword(passwordLama, userRow.password_hash);
      if (!ok) {
        return c.json(
          { status: 'fail', message: 'Kata sandi lama salah. Silakan periksa kembali.' },
          401
        );
      }

      if (passwordLama === passwordBaru) {
        return c.json(
          { status: 'fail', message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama.' },
          400
        );
      }

      const newHash = await hashPassword(passwordBaru);
      await d1Client.query(
        `UPDATE users SET password_hash = ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = ?`,
        [newHash, userId]
      );

      return c.json({
        status: 'success',
        message: 'Kata sandi berhasil diubah. Gunakan kata sandi baru pada login berikutnya.',
      });
    } catch (err: any) {
      return c.json(
        {
          status: 'error',
          message: err.message || 'Terjadi kesalahan sistem saat mengubah kata sandi.',
        },
        500
      );
    }
  });

  return router;
}
