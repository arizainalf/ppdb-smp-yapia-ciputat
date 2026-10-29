# Panduan Konfigurasi Google Sign-In untuk Panitia
## "Masuk dengan Google" — Terhubung dengan Akun yang Didaftarkan Admin

Dokumen ini menjelaskan langkah demi langkah menambahkan fitur **Sign in with Google** khusus form login **Panitia PPDB**. Prinsipnya: Google hanya sebagai *identitas* (email terverifikasi), sementara **otorisasi tetap dari tabel `users`** yang dikelola admin — akun Google yang tidak terdaftar oleh admin akan ditolak.

---

## 1. Prinsip Analisa & Pencocokan Akun

```
Panitia klik "Masuk dengan Google"
  → Popup Google login → frontend menerima ID Token
  → POST /api/auth/google (kirim ID Token ke backend)
  → Backend verifikasi token ke Google → dapat email + google_sub
  → COCOKKAN dengan tabel users (didaftarkan admin)
  → Lolos? → Terbitkan JWT (sama seperti login password)
```

Matriks keputusan di backend:

| Kondisi di tabel `users` | Hasil |
|---|---|
| Email tidak ditemukan | **Tolak (404)** — "Email Google Anda tidak terdaftar. Hubungi Administrator." |
| Ditemukan tapi `is_active = 0` | **Tolak (403)** — "Akun dinonaktifkan oleh Administrator." |
| Ditemukan, aktif, `google_sub` masih kosong | **Link otomatis** — simpan `google_sub`, terbitkan JWT (login pertama) |
| Ditemukan, aktif, `google_sub` cocok | **Terbitkan JWT** (login berikutnya) |
| Ditemukan, aktif, `google_sub` berbeda dari yang tersimpan | **Tolak (401)** — email dicoba di-link ke akun lain |

> **Kenapa aman?** Email di akun Google sudah diverifikasi kepemilikannya oleh Google. Jadi kecocokan email dengan akun yang didaftarkan admin adalah analisa otorisasinya — tidak ada yang bisa masuk kecuali pemilik asli email tersebut.

**Catatan desain**: user dengan `email = NULL` tidak bisa memakai Google login dan tetap fallback ke password. Jangan hapus form password.

---

## 2. Prasyarat

1. Domain frontend sudah aktif dan di-host di Cloudflare (mis. `ppdb.yapia.sch.id`), karena origin ini yang akan didaftarkan di Google Cloud Console.
2. Akun Google (bisa memakai akun sekolah jika ada Google Workspace).
3. Akses database D1 untuk migrasi skema.

---

## 3. Langkah Konfigurasi Google Cloud Console

### Langkah 1: Buat Project

1. Buka [console.cloud.google.com](https://console.cloud.google.com/).
2. Klik dropdown project (pojok kiri atas) → **New Project**.
3. Nama: `SIPMB SMP YAPIA` → **Create** → pilih project tersebut.

### Langkah 2: Konfigurasi OAuth Consent Screen

1. Menu ☰ → **APIs & Services** → **OAuth consent screen**.
2. **User Type**: pilih **Internal** (jika sekolah pakai Google Workspace — otomatis membatasi ke domain sekolah) atau **External** (jika tidak).
3. Isi:
   - **App name**: `PPDB SMP YAPIA Ciputat`
   - **User support email**: email panitia/admin
   - **Developer contact**: email admin
4. **Scopes**: tidak perlu tambah apa pun (cukup default `email`, `profile`, `openid`).
5. Jika **External**: tambahkan email panitia di bagian **Test users** selama masih mode testing (status *Testing* berlaku 7 hari per token; naikkan ke *In production* saat go-live).

### Langkah 3: Buat OAuth Client ID

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. **Application type**: **Web application**.
3. **Name**: `SIPMB Frontend`.
4. **Authorized JavaScript origins** (wajib persis, tanpa trailing slash):
   - `https://ppdb.yapia.sch.id` (produksi)
   - `http://localhost:5173` (development Vite)
5. Biarkan **Authorized redirect URIs** kosong (Google Identity Services memakai popup, bukan redirect).
6. **Create** → salin **Client ID** (format: `xxxx.apps.googleusercontent.com`).

> Tidak ada *Client Secret* yang dipakai di frontend — hanya Client ID. Verifikasi keaslian token dilakukan di backend.

---

## 4. Langkah Migrasi Skema Database (D1)

Tambahkan kolom `google_sub` di tabel `users`.

### Langkah 1: Tambahkan ke File Skema

Edit `deploy/d1/schema.sql`, di dalam `CREATE TABLE IF NOT EXISTS users (...)` tambahkan:

```sql
google_sub TEXT UNIQUE, -- ID unik akun Google yang ter-link (NULL = belum pernah login via Google)
```

### Langkah 2: Tambahkan Kolom ke Database Produksi

SQLite melarang constraint `UNIQUE` pada `ALTER TABLE ADD COLUMN`, jadi dibuat via unique index:

```bash
# dari root repo
npx wrangler d1 execute yapia_sipmb_db --command="ALTER TABLE users ADD COLUMN google_sub TEXT;" --remote
npx wrangler d1 execute yapia_sipmb_db --command="CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);" --remote
```

Verifikasi:

```bash
npx wrangler d1 execute yapia_sipmb_db --command="PRAGMA table_info(users);" --remote
```

---

## 5. Langkah Implementasi Backend (Hono)

### Langkah 1: Simpan Client ID via Secret/Var

Client ID dipakai frontend, tetapi backend juga memakainya untuk validasi klaim `aud`. Set sebagai secret:

```bash
cd apps/backend
npx wrangler secret put GOOGLE_CLIENT_ID
```

### Langkah 2: Buat Endpoint `POST /auth/google`

Buat/extend `apps/backend/src/infrastructure/http/routes/authRoutes.ts`:

```typescript
router.post('/google', async (c) => {
  const { credential } = await c.req.json(); // ID Token dari Google Identity Services
  if (!credential) {
    return c.json({ status: 'fail', message: 'Credential Google wajib dikirim.' }, 400);
  }

  // 1. Verifikasi token ke Google (server-side, trafik sekolah kecil — cukup tokeninfo)
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!res.ok) {
    return c.json({ status: 'fail', message: 'Token Google tidak valid.' }, 401);
  }
  const g: any = await res.json();

  // 2. Validasi klaim: audience = Client ID kita, token belum kadaluarsa
  const clientId = ((c.env as any)?.GOOGLE_CLIENT_ID as string) || process.env?.GOOGLE_CLIENT_ID;
  if (g.aud !== clientId || Number(g.exp) * 1000 < Date.now()) {
    return c.json({ status: 'fail', message: 'Token Google tidak ditujukan untuk aplikasi ini.' }, 401);
  }

  const email = String(g.email).trim().toLowerCase();
  const googleSub = String(g.sub);

  // 3. Analisa: cocokkan dengan akun yang didaftarkan admin
  const d1Res = await d1Client.query<any>(
    `SELECT id, nama_lengkap, no_hp, email, role, is_active, google_sub
     FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1`,
    [email]
  );

  if (d1Res.results.length === 0) {
    return c.json({ status: 'fail', message: 'Email Google Anda tidak terdaftar. Hubungi Administrator.' }, 404);
  }
  const user = d1Res.results[0];

  if (user.is_active !== 1) {
    return c.json({ status: 'fail', message: 'Akun panitia Anda dinonaktifkan oleh Administrator.' }, 403);
  }
  if (user.google_sub && user.google_sub !== googleSub) {
    return c.json({ status: 'fail', message: 'Akun ini sudah ter-link dengan Google lain.' }, 401);
  }

  // 4. Link pertama kali: simpan google_sub
  if (!user.google_sub) {
    await d1Client.query(
      `UPDATE users SET google_sub = ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) WHERE id = ?`,
      [googleSub, user.id]
    );
  }

  // 5. Terbitkan JWT (identik dengan login password)
  const token = await signJwt(
    { sub: user.id, role: user.role, nama: user.nama_lengkap },
    getJwtSecret(c)
  );

  return c.json({
    status: 'success',
    message: 'Login Google berhasil.',
    data: {
      user: {
        id: user.id, namaLengkap: user.nama_lengkap, noHp: user.no_hp,
        email: user.email, role: user.role, isActive: true,
      },
      token,
    },
  });
});
```

> Pastikan router sudah terdaftar seperti `/login` di `server.ts` (biasanya sudah otomatis karena masih satu `createAuthRouter`).

---

## 6. Langkah Implementasi Frontend (React)

### Langkah 1: Muat Skrip Google

Tambahkan di `apps/frontend/index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Langkah 2: Simpan Client ID

Buat `.env` di `apps/frontend`:

```bash
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

### Langkah 3: Tombol Google di Form Panitia

Di `LoginPage.tsx` (section `loginType === 'panitia'`), di bawah `<Button type="submit">`:

```tsx
{/* Divider */}
<div className="flex items-center gap-3 my-1">
  <div className="h-px flex-1 bg-slate-200" />
  <span className="text-[11px] text-slate-400 uppercase tracking-wider">atau</span>
  <div className="h-px flex-1 bg-slate-200" />
</div>

<div
  id="googleBtnPanitia"
  className="flex justify-center"
  ref={(el) => {
    if (el && (window as any).google && !(el as any).rendered) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (resp: any) => handleGoogleLogin(resp.credential),
      });
      (window as any).google.accounts.id.renderButton(el, {
        theme: 'outline', size: 'large', width: 320, text: 'signin_with',
      });
      (el as any).rendered = true;
    }
  }}
/>
```

Handler-nya cukup memanggil endpoint baru lalu menyimpan token seperti login biasa:

```tsx
const handleGoogleLogin = async (credential: string) => {
  setIsLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const json = await res.json();
    if (json.status === 'success') {
      localStorage.setItem('token', json.data.token);
      localStorage.setItem('user', JSON.stringify(json.data.user));
      navigate('/admin'); // sesuaikan dengan redirect login panitia yang ada
    } else {
      setError(json.message);
    }
  } finally {
    setIsLoading(false);
  }
};
```

---

## 7. Langkah Verifikasi (Uji End-to-End)

1. **Siapkan akun uji**: pastikan admin sudah mendaftarkan user panitia dengan email Gmail sungguhan yang bisa diakses (kolom `email` terisi, `is_active = 1`).
2. Buka `http://localhost:5173` → tab **Panitia** → tombol Google muncul → login dengan email tersebut.
   - **Ekspektasi**: berhasil masuk; cek D1: kolom `google_sub` terisi.
3. Logout → login ulang via Google.
   - **Ekspektasi**: langsung masuk (jalur `google_sub` cocok).
4. Login Google dengan **email yang tidak terdaftar**.
   - **Ekspektasi**: ditolak 404 "tidak terdaftar".
5. Nonaktifkan akun dari admin (`is_active = 0`) → login Google.
   - **Ekspektasi**: ditolak 403.
6. Cek JWT yang tersimpan identik dengan format login password (role, sub, nama).

---

## 8. Troubleshooting

| Masalah | Penyebab & Solusi |
|---|---|
| Popup Google: "origin_mismatch" | Origin belum didaftarkan di **Authorized JavaScript origins**. Harus persis sama (skema + domain + port, tanpa trailing slash). |
| Popup tidak muncul / tertutup sendiri | Skrip `gsi/client` belum termuat, atau browser memblokir popup pihak ketiga. |
| Backend: `Token Google tidak valid` (401) | `credential` kadaluarsa atau dipotong saat dikirim. ID token hanya berlaku ±1 jam dan harus dikirim utuh. |
| Backend: `tidak ditujukan untuk aplikasi ini` (401) | Klaim `aud` ≠ Client ID. Pastikan `GOOGLE_CLIENT_ID` di backend sama dengan `VITE_GOOGLE_CLIENT_ID` di frontend. |
| Consent screen "unverified app" | Status masih *Testing* dan email penguji belum ditambahkan. Tambahkan **Test users** atau ubah ke *In production*. |
| Tombol Google tidak render di tab Panitia | `id="googleBtnPanitia"` dirender ulang saat ganti tab — guard `(el as any).rendered` mencegah render ganda; pastikan dipakai. |
| User `email = NULL` tidak bisa login Google | Sesuai desain — perbarui email user lewat admin terlebih dahulu. |

---

## 9. Catatan Keamanan

1. **Jangan pakai Client Secret di frontend** — hanya Client ID. Secret tidak diperlukan untuk alur popup ini.
2. Verifikasi token **wajib di backend** — jangan pernah percaya email yang dikirim frontend mentah-mentah.
3. `google_sub` bersifat `UNIQUE` — satu akun Google hanya bisa ter-link ke satu user.
4. Token Google tidak disimpan di database — hanya `google_sub` (ID statis, bukan kredensial).
5. Jika sekolah memakai Google Workspace, pilih **User Type: Internal** di consent screen agar hanya anggota domain sekolah yang bisa login.
