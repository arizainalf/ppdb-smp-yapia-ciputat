# Runbook Deployment Produksi: Persiapan sampai Selesai
## SIPMB SMP YAPIA Ciputat

Checklist end-to-end untuk melakukan deployment dari nol maupun rilis pembaruan (termasuk penambahan fitur dan migrasi database). Untuk SOP teknis migrasi schema secara mendalam (backup, rollback, strategi ALTER), baca [`PANDUAN_MIGRASI_SCHEMA_DAN_DEPLOYMENT.md`](PANDUAN_MIGRASI_SCHEMA_DAN_DEPLOYMENT.md).

---

## Tahap 0 — Prasyarat

- [ ] Node.js v20+ dan pnpm terpasang (`corepack enable` atau `npm i -g pnpm`).
- [ ] Akun Cloudflare aktif, sudah login: `npx wrangler login` (jalankan dari root monorepo).
- [ ] Database D1 `yapia_sipmb_db` sudah dibuat; cek `npx wrangler d1 list` dan pastikan `database_id` di `apps/backend/wrangler.jsonc` sesuai.
- [ ] Akun Tripay aktif (mode sandbox untuk uji, produksi untuk go-live) — https://tripay.co.id
- [ ] Semua perubahan sudah lolos `npx tsc --noEmit` di `packages/shared`, `apps/backend`, `apps/frontend`.

---

## Tahap 1 — Persiapan Environment & Secret

### 1a. Backend (Cloudflare Workers)
Nilai non-sensitif boleh di `apps/backend/wrangler.jsonc` (vars). Nilai sensitif **wajib** via secret:

```bash
cd apps/backend

# WAJIB — kunci penandatanganan JWT (min. 32 karakter acak)
openssl rand -hex 32        # salin hasilnya
npx wrangler secret put JWT_SECRET

# WAJIB jika fitur pembayaran Tripay aktif
npx wrangler secret put TRIPAY_MERCHANT_CODE
npx wrangler secret put TRIPAY_API_KEY
npx wrangler secret put TRIPAY_PRIVATE_KEY

# Opsional — instruksi transfer manual (ada default di kode)
npx wrangler secret put MANUAL_BANK_NAMA
npx wrangler secret put MANUAL_BANK_NOMOR
npx wrangler secret put MANUAL_BANK_ATAS_NAMA
```

Referensi lengkap daftar variabel: [`deploy/.env.example`](../deploy/.env.example).

- `TRIPAY_BASE_URL`: `https://tripay.co.id/api-sandbox` untuk uji, `https://tripay.co.id/api` untuk produksi (bisa sebagai var di `wrangler.jsonc`).

### 1b. Frontend (Cloudflare Pages)
File `apps/frontend/.env.production`:

```env
VITE_API_URL=https://sipmb-api.11260103.workers.dev
```

Ganti sesuai custom domain backend bila sudah terpasang.

---

## Tahap 2 — Database (Pilih Salah Satu Skenario)

### Skenario A: Database baru (instalasi pertama)
```bash
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/schema.sql --remote
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/seed.sql --remote
```
> Seed membuat 5 akun panitia demo dengan password `password123` (tersimpan sebagai hash PBKDF2). **Ganti password semua akun sebelum go-live.**

### Skenario B: Database eksisting (rilis pembaruan)
1. **Backup dulu** (wajib untuk perubahan berisiko):
   ```bash
   npx wrangler d1 export yapia_sipmb_db --remote --output=backup_d1_pra_rilis.sql
   ```
2. Jalankan migrasi berurutan sesuai yang belum diterapkan:
   ```bash
   # Kolom payment gateway (Tripay) pada pembayaran_pendaftaran
   npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0002_kolom_payment_gateway.sql --remote

   # Jenis berkas baru: KTP_ORANG_TUA (rebuild tabel berkas_pendaftaran)
   npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0003_jenis_ktp_orang_tua.sql --remote
   ```
3. Verifikasi:
   ```bash
   npx wrangler d1 execute yapia_sipmb_db --command="PRAGMA table_info(pembayaran_pendaftaran);" --remote
   npx wrangler d1 execute yapia_sipmb_db --command="SELECT sql FROM sqlite_master WHERE name='berkas_pendaftaran';" --remote
   ```

**Aturan untuk rilis berikutnya:** setiap perubahan schema = file baru bernomor di `deploy/d1/migrations/` + sinkronkan `deploy/d1/schema.sql` (master). Jangan pernah mengedit file migrasi yang sudah dijalankan di produksi.

---

## Tahap 3 — Deploy Aplikasi

```bash
# Dari root monorepo
pnpm typecheck        # opsional tapi disarankan
pnpm deploy:backend   # bundle + deploy Workers (tanpa build manual)
pnpm deploy:frontend  # build Vite + deploy Pages
# atau sekaligus:
pnpm deploy:all
```

---

## Tahap 4 — Konfigurasi Dashboard Tripay (jika fitur payment aktif)

1. Login dashboard Tripay → **Merchant → Settings → Callback URL**, isi:
   ```
   https://<DOMAIN-BACKEND>/api/v1/pembayaran/tripay/callback
   ```
   Contoh: `https://sipmb-api.11260103.workers.dev/api/v1/pembayaran/tripay/callback`
2. Pastikan channel pembayaran **QRIS** berstatus aktif.
3. Catat `merchant_code`, `api_key`, `private_key` → pastikan sudah di-set sebagai secret (Tahap 1a).

---

## Tahap 5 — Verifikasi Pasca-Deploy (Uji Acceptance)

| # | Uji | Cara | Hasil diharapkan |
|---|-----|------|------------------|
| 1 | Health check | `curl https://<DOMAIN-BACKEND>/health` | `{"status":"ok",...}` |
| 2 | Login panitia | Login `081200000001` / `password123` (atau password baru) | Token `eyJ...` (JWT HS256) |
| 3 | Proteksi berjalan | `curl <API>/api/v1/users` tanpa token | `401` |
| 4 | Registrasi mandiri | Isi wizard sampai Step 5, unggah 4 berkas wajib, submit | Nomor pendaftaran terbit |
| 5 | Pembayaran manual | Pilih "Transfer Bank Manual" → konfirmasi | Status `PENDING` |
| 6 | Verifikasi Bendahara | Login BENDAHARA → verifikasi pembayaran pendaftar uji | Status `PAID` |
| 7 | Pembayaran Tripay (sandbox) | Pilih "Bayar Online via Tripay" | Invoice + checkout URL terbit |
| 8 | Callback Tripay | Selesaikan pembayaran sandbox | Status otomatis jadi `PAID` (cek log: `npx wrangler tail`) |
| 9 | Halaman cek status | Buka frontend → Cek Status dengan nomor pendaftaran | Data muncul tanpa login |

---

## Tahap 6 — Go-Live Produksi

- [ ] `TRIPAY_BASE_URL` diganti ke `https://tripay.co.id/api` (bukan sandbox).
- [ ] Password seluruh akun panitia sudah diganti dari `password123`.
- [ ] `JWT_SECRET` produksi sudah diset (bukan default dev).
- [ ] Instruksi transfer manual (`MANUAL_BANK_*`) sudah memakai rekening resmi sekolah.
- [ ] Callback URL Tripay produksi terdaftar.
- [ ] Monitoring siap: `npx wrangler tail` saat gelombang pendaftaran dibuka.

---

## Rollback Singkat

- **Deploy kode buruk**: deploy ulang commit sebelumnya (`pnpm deploy:all` dari checkout lama).
- **Migrasi gagal/merusak**: restore dari backup `npx wrangler d1 execute yapia_sipmb_db --file=backup_d1_pra_rilis.sql --remote` (koordinasikan dulu — backup berisi DROP/CREATE penuh).
- **Tripay bermasalah di hari-H**: pendaftar tetap bisa memakai jalur **Transfer Manual**; matikan opsi Tripay dari UI bila perlu.
