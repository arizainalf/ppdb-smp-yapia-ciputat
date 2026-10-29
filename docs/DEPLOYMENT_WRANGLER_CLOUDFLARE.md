# Panduan Deployment via Wrangler
## Backend (Hono → Cloudflare Workers) & Frontend (Vite → Cloudflare Pages)

Dokumen ini melengkapi [`DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md`](DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md). Fokusnya: men-deploy **Frontend** dan **Backend** langsung ke edge Cloudflare menggunakan **Wrangler CLI**, sehingga keduanya tidak lagi membutuhkan Docker container dan Cloudflare Tunnel di server.

---

## 1. Wrangler vs Cloudflared — Pahami Dulu Bedanya

| Aspek | `cloudflared` (Tunnel) | `wrangler` |
|---|---|---|
| Fungsi | Menjalankan trafik publik ke server/container lokal | Deploy aplikasi langsung ke Cloudflare Edge |
| Aplikasi | Vault, Redis (tetap di server) | Frontend + Backend (pindah ke edge) |
| Butuh server? | Ya (VPS/on-premise) | Tidak, 100% serverless |
| Custom domain | Public Hostname di dashboard Tunnel | Domains & Routes di dashboard Workers/Pages |

> **Catatan**: Jika FE & BE sudah pindah ke Workers/Pages, tunnel hanya dipakai untuk `vault.yapia.sch.id`. Redis dihapus dari stack (Workers tidak bisa akses TCP Redis; cache memakai Cache API / KV bila diperlukan).

---

## 2. Prasyarat

1. Akun Cloudflare aktif dengan database D1 `yapia_sipmb_db` (lihat Langkah 1–2 di dokumen infrastruktur).
2. **Account ID** dan **Database ID** D1 (di Dashboard → Storage & Databases → D1).
3. Node.js ≥ 18 di mesin deploy.

---

## 3. Langkah Deployment Backend (Hono → Workers)

### Langkah 1: Install Wrangler & Login

```bash
cd apps/backend
npm i -D wrangler
npx wrangler login   # browser terbuka, klik Allow
```

Verifikasi login:

```bash
npx wrangler whoami
```

### Langkah 2: Buat `wrangler.jsonc`

Buat file `apps/backend/wrangler.jsonc`:

```jsonc
{
  "name": "sipmb-api",
  "main": "src/worker.ts",
  "compatibility_date": "2026-10-01",
  "vars": {
    "GOOGLE_CLIENT_ID": "xxxx.apps.googleusercontent.com"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "yapia_sipmb_db",
      "database_id": "<DATABASE_ID>"
    }
  ]
}
```

Ganti `<DATABASE_ID>` dengan Database ID dari dashboard. Key di blok `vars` adalah environment variable non-rahasia yang terbaca dari `c.env` saat runtime (lihat bagian Environment Variables di Langkah 5).

### Langkah 3: Buat Entry Point Workers

Entry saat ini adalah `src/infrastructure/server.ts` yang menjalankan `serve()` (Node). Workers butuh entry yang **export** app Hono. Buat `apps/backend/src/worker.ts`:

```typescript
import app from './infrastructure/server'; // app Hono yang sudah ada

export default app;
```

> Jika `server.ts` memanggil `serve()` di top-level, pisahkan: definisi `app` dipindah ke file tersendiri (mis. `src/app.ts`), lalu `server.ts` (Node) dan `worker.ts` (Workers) keduanya meng-import `app` dari sana.

### Langkah 4: Ganti Akses D1 ke Binding Native

Saat ini `src/infrastructure/database/d1Client.ts` memanggil REST API `api.cloudflare.com` dengan Bearer Token. Di Workers, ganti ke binding native — lebih cepat, tanpa API token, tanpa quota REST:

```typescript
// Sebelum (HTTP API)
fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, { ... })

// Sesudah (native binding)
const { results } = await c.env.DB.prepare(
  'SELECT * FROM gelombang_pendaftaran WHERE is_active = 1'
).all();
```

Perubahan lain yang wajib:

| Sebelum (Node) | Sesudah (Workers) |
|---|---|
| `process.env.JWT_SECRET` | `c.env.JWT_SECRET` |
| `.env` file | `npx wrangler secret put <NAMA>` |
| Filesystem / Redis | Tidak tersedia; gunakan KV / Cache API |

### Langkah 5: Set Environment Variables (Workers Tidak Punya `.env`)

Runtime Workers **tidak membaca file `.env`**. Semua nilai dari `.env` lokal harus dipindah ke salah satu dari dua tempat ini:

**a. Non-secret → blok `vars` di `wrangler.jsonc`** (atau dashboard → Settings → Variables and Secrets):

```jsonc
"vars": {
  "GOOGLE_CLIENT_ID": "xxxx.apps.googleusercontent.com"
}
```

**b. Secret / sensitif → via Wrangler CLI** (disimpan terenkripsi, tidak boleh masuk git):

```bash
npx wrangler secret put JWT_SECRET
# tempel nilai secret, lalu Enter

npx wrangler secret put GOOGLE_CLIENT_ID   # alternatif: boleh juga di "vars"
```

Ulangi untuk setiap secret lain yang dipakai (mis. token payment gateway, dsb). Kode membacanya lewat `c.env.NAMA_VAR` — sudah didukung pola `getJwtSecret()` yang ada.

Ringkasan env project ini:

| Variabel | Jenis | Tempat di Workers |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Non-secret (Client ID memang publik) | `vars` wrangler.jsonc / `secret put` |
| `JWT_SECRET` | Secret | `npx wrangler secret put` |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, `CLOUDFLARE_API_TOKEN` | Tidak diperlukan lagi | Ditinggalkan — akses D1 sudah via native binding `DB` |

### Langkah 6: Migrasi Skema ke D1 Produksi

```bash
# dari root repo
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/schema.sql --remote
```

Cek hasilnya:

```bash
npx wrangler d1 execute yapia_sipmb_db --command="SELECT name FROM sqlite_master WHERE type='table'" --remote
```

> Untuk database lokal saat development, jalankan tanpa `--remote` (Wrangler membuat D1 lokal otomatis di `.wrangler/state`).

### Langkah 7: Uji Lokal (Opsional tapi Disarankan)

```bash
cd apps/backend
npx wrangler dev
```

Workers versi lokal berjalan di `http://localhost:8787` lengkap dengan binding D1 lokal. Uji endpoint `/health` dan alur pendaftaran sebelum deploy.

### Langkah 8: Deploy

```bash
cd apps/backend
npx wrangler deploy
```

Output berisi URL sementara: `https://sipmb-api.<subdomain>.workers.dev`. Verifikasi:

```bash
curl https://sipmb-api.<subdomain>.workers.dev/health
```

### Langkah 9: Pasang Custom Domain

1. Buka **Cloudflare Dashboard** → **Workers & Pages** → `sipmb-api`.
2. **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
3. Masukkan `api-ppdb.yapia.sch.id` → konfirmasi.
4. Cloudflare otomatis membuat record DNS (domain harus berada di akun Cloudflare yang sama). **Tidak perlu tunnel.**

---

## 4. Langkah Deployment Frontend (Vite → Pages)

### Langkah 1: Build & Deploy

`VITE_*` di-bake **saat build**, bukan saat runtime — jadi env harus sudah ada sebelum `npm run build`:

**Opsi A — pakai `.env` lokal** (`apps/frontend/.env`, sudah ada di repo):

```bash
cd apps/frontend
npm run build
npx wrangler pages deploy dist --project-name=sipmb-frontend
```

**Opsi B — inline saat build** (tanpa .env):

```bash
cd apps/frontend
VITE_API_URL=https://api-ppdb.yapia.sch.id \
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com \
npm run build
npx wrangler pages deploy dist --project-name=sipmb-frontend
```

> Deploy via git integration? Set env di dashboard Pages → Settings → **Environment variables** (berlaku sebagai build-time env), lalu trigger redeploy. Mengubah nilai env **selalu** butuh build ulang.

### Langkah 2: Pasang Custom Domain

1. Dashboard → **Workers & Pages** → `sipmb-frontend`.
2. **Custom domains** → **Set up a custom domain** → `ppdb.yapia.sch.id`.

### Langkah 3: Redeploy Saat Ada Perubahan

```bash
cd apps/frontend
npm run build
npx wrangler pages deploy dist --project-name=sipmb-frontend
```

Setiap deploy membuat *deployment* baru; versi lama bisa di-rollback dari dashboard (tab **Deployments**).

---

## 5. Stack Akhir Setelah Migrasi

| Komponen | Sebelum | Sesudah |
|---|---|---|
| Frontend | Docker container (port 3000) + tunnel | Cloudflare Pages (`ppdb.yapia.sch.id`) |
| Backend | Docker container (port 8000) + tunnel | Cloudflare Workers (`api-ppdb.yapia.sch.id`) |
| Database | D1 via REST API + token | D1 via native binding (tanpa token) |
| Vault | Docker + tunnel | **Tetap** Docker + tunnel (`vault.yapia.sch.id`) |
| Redis | Docker internal | **Dihapus** (gunakan Cache API/KV bila perlu) |

Container `cloudflared`, `frontend`, `backend`, `redis` bisa dihapus dari `docker compose`; sisakan `vault` + `cloudflared`.

---

## 6. Cheat Sheet Perintah

```bash
# Backend
npx wrangler login                          # autentikasi
npx wrangler whoami                         # cek akun aktif
npx wrangler dev                            # dev lokal (port 8787)
npx wrangler deploy                         # deploy ke produksi
npx wrangler secret put JWT_SECRET          # set secret
npx wrangler secret put GOOGLE_CLIENT_ID    # atau via "vars" di wrangler.jsonc
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/schema.sql --remote   # migrasi skema
npx wrangler tail                           # log produksi real-time
npx wrangler deployments list               # riwayat deploy

# Frontend
npm run build                               # build Vite
npx wrangler pages deploy dist --project-name=sipmb-frontend   # deploy

# Rollback
# Dashboard → Workers & Pages → pilih project → Deployments → pilih versi → Rollback
```

---

## 7. Troubleshooting

| Masalah | Penyebab & Solusi |
|---|---|
| `Error 1101` di endpoint | Exception di Workers. Jalankan `npx wrangler tail`, lihat stack trace. |
| `D1_ERROR: no such table` | Skema belum dimigrasi. Jalankan `wrangler d1 execute ... --remote`. |
| FE gagal fetch API (CORS) | Pastikan backend memakai `cors()` dan `VITE_API_URL` menunjuk ke domain backend yang benar. |
| Secret terbaca `undefined` | Secret belum di-set atau di-set setelah deploy terakhir. Set ulang lalu `wrangler deploy`. |
| Perubahan env FE tidak muncul | `VITE_*` di-bake saat build. Build ulang sebelum deploy. |
| Custom domain gagal diverifikasi | Domain harus aktif (di-host DNS) di akun Cloudflare yang sama. |
