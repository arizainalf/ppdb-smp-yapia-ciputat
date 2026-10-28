# Panduan Operasional: Migrasi Schema Database D1 & Deployment Produksi
## SIPMB SMP YAPIA Ciputat (Cloudflare Workers, Pages & D1)

Dokumen ini merupakan panduan standar operasional (SOP) bagi tim pengembang dan administrator dalam mengelola **perubahan skema database (D1 Migration)**, **siklus deployment Frontend & Backend**, dan **manajemen custom domain** pada infrastruktur Cloudflare.

---

## 1. Ringkasan Kredensial & Lingkungan Aktif

Aplikasi SIPMB SMP YAPIA Ciputat saat ini telah berjalan secara aktif (*live*) pada ekosistem Cloudflare:

| Komponen | Layanan Cloudflare | Nama Resource | Identifier / URL | Custom Domain |
|---|---|---|---|---|
| **Database** | Cloudflare D1 (Serverless SQLite) | `yapia_sipmb_db` | `2860805a-50d3-42a3-ab32-aca15f4516cb` | - |
| **Backend API** | Cloudflare Workers (Hono) | `sipmb-api` | `https://sipmb-api.11260103.workers.dev` | `api-ppdb.yapia-ciputat.web.id` *(opsional)* |
| **Frontend** | Cloudflare Pages (React + Vite) | `ppdb-smp-yapia` | `https://ppdb-smp-yapia.pages.dev` | `https://sipmb.yapia-ciputat.web.id` |
| **Akun Pemilik** | Cloudflare Account | `11260103@nusamandiri.ac.id` | Account ID: `6e7fda31b1b8812ae1e4c91c2ef977fa` | - |

---

## 2. Alur Migrasi Schema Database (Cloudflare D1)

Cloudflare D1 menggunakan mesin **SQLite**. Setiap ada penambahan fitur baru (misalnya kolom baru, tabel baru, atau indeks), ikuti panduan berikut agar data calon siswa yang sudah terdaftar tetap aman.

### A. Skenario 1: Menambah Kolom Baru ke Tabel yang Ada

Contoh: Ingin menambahkan kolom `nomor_rekening_pengirim` pada tabel `calon_siswa`.

#### Langkah 1: Buat Script Migrasi SQL
Buat file baru di folder `deploy/d1/migrations/` (atau gunakan perintah langsung):
```sql
-- deploy/d1/migrations/0002_tambah_rekening.sql
ALTER TABLE calon_siswa ADD COLUMN nomor_rekening_pengirim TEXT;
```

#### Langkah 2: Uji Coba di Database Lokal (Opsional)
Jalankan migrasi pada database simulasi lokal tanpa bendera `--remote`:
```powershell
npx wrangler d1 execute yapia_sipmb_db --command="ALTER TABLE calon_siswa ADD COLUMN nomor_rekening_pengirim TEXT;"
```

#### Langkah 3: Eksekusi ke Database Produksi Remote
Tambahkan parameter `--remote` untuk mengeksekusinya ke server Cloudflare D1 asli:
```powershell
npx wrangler d1 execute yapia_sipmb_db --command="ALTER TABLE calon_siswa ADD COLUMN nomor_rekening_pengirim TEXT;" --remote
```
Atau jika menggunakan file `.sql`:
```powershell
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0002_tambah_rekening.sql --remote
```

#### Langkah 4: Verifikasi Hasil Migrasi
Periksa apakah kolom baru sudah masuk:
```powershell
npx wrangler d1 execute yapia_sipmb_db --command="PRAGMA table_info(calon_siswa);" --remote
```

---

### B. Skenario 2: Menambah Tabel Baru

Contoh: Ingin menambahkan tabel `pembayaran_infak`.

1. Tulis query DDL di file SQL:
   ```sql
   CREATE TABLE IF NOT EXISTS pembayaran_infak (
       id TEXT PRIMARY KEY,
       calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
       jumlah_bayar INTEGER NOT NULL,
       metode_transfer TEXT NOT NULL,
       bukti_transfer_url TEXT,
       status_verifikasi TEXT NOT NULL DEFAULT 'MENUNGGU' CHECK(status_verifikasi IN ('MENUNGGU', 'VALID', 'DITOLAK')),
       diverifikasi_oleh TEXT,
       created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   );
   ```
2. Jalankan ke Cloudflare D1:
   ```powershell
   npx wrangler d1 execute yapia_sipmb_db --command="CREATE TABLE IF NOT EXISTS pembayaran_infak (...);" --remote
   ```
3. Perbarui juga file master [`deploy/d1/schema.sql`](file:///D:/Project/ppdb-smp-yapia-ciputat/deploy/d1/schema.sql) agar skema master repositori selalu sinkron dengan kondisi produksi.

---

### C. Backup Database D1 Sebelum Perubahan Besar

Sebelum melakukan perubahan skema yang berisiko, selalu lakukan ekspor data cadangan (*backup*):
```powershell
# Ekspor seluruh skema dan isi tabel D1 ke file lokal
npx wrangler d1 export yapia_sipmb_db --remote --output=backup_d1_$(Get-Date -Format 'yyyyMMdd_HHmm').sql
```

> [!CAUTION]
> **Keterbatasan SQLite**: SQLite tidak mendukung pengubahan tipe data kolom yang sudah ada (`ALTER COLUMN TYPE`) secara langsung. Jika harus mengubah tipe data, lakukan strategi: buat tabel baru (`_new`), salin data (`INSERT INTO ... SELECT`), hapus tabel lama, lalu ganti nama tabel baru.

---

## 3. Prosedur Deployment Aplikasi

### Mengapa Frontend Perlu Build Dulu sedangkan Backend Tidak?

1. **Frontend (Cloudflare Pages):**
   * **Wajib Build Terlebih Dahulu.** Kode React (`.tsx`) dan Tailwind CSS harus dikompilasi oleh Vite menjadi aset statis murni (`index.html`, bundle `.js`, `.css`) di folder `apps/frontend/dist`. Jika Anda langsung deploy tanpa build, Cloudflare Pages hanya akan mengunggah isi folder `dist` lama.
2. **Backend (Cloudflare Workers):**
   * **Bisa Langsung Deploy.** Wrangler sudah dilengkapi *compiler* esbuild internal. Saat Anda menjalankan `wrangler deploy`, Wrangler otomatis membaca `worker.ts`, membungkus seluruh router Hono, dan mengunggahnya ke Cloudflare Workers.

---

### ⚡ Shortcut Perintah Deployment (Dari Root Monorepo)

Di file [`package.json`](file:///D:/Project/ppdb-smp-yapia-ciputat/package.json), telah disiapkan jalan pintas otomatis:

```powershell
# 1. Deploy Frontend (Otomatis build dulu, lalu unggah ke Cloudflare Pages)
pnpm deploy:frontend

# 2. Deploy Backend (Otomatis bundle TypeScript dan deploy ke Workers)
pnpm deploy:backend

# 3. Deploy Keduanya Sekaligus
pnpm deploy:all
```

---

## 4. Konfigurasi Lingkungan (Environment Variables)

### A. Frontend (`apps/frontend/.env.production`)
Aplikasi frontend menggunakan variabel lingkungan Vite yang di-*bake* saat proses `build`:
```env
VITE_API_URL=https://sipmb-api.11260103.workers.dev
```
Jika backend nantinya dipasangi custom domain (misalnya `https://api-ppdb.yapia-ciputat.web.id`), cukup ubah baris di atas pada file `.env.production`, lalu jalankan kembali `pnpm deploy:frontend`.

### B. Backend (`apps/backend/wrangler.jsonc`)
File konfigurasi Worker:
```jsonc
{
  "name": "sipmb-api",
  "main": "src/worker.ts",
  "compatibility_date": "2026-10-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "yapia_sipmb_db",
      "database_id": "2860805a-50d3-42a3-ab32-aca15f4516cb"
    }
  ]
}
```

Jika ada nilai sensitif (seperti `JWT_SECRET` atau token WhatsApp gateway), jangan simpan di file JSON. Masukkan via Cloudflare Secrets:
```powershell
cd apps/backend
npx wrangler secret put JWT_SECRET
```

---

## 5. Menghubungkan Custom Domain Baru

### A. Menambah Custom Domain pada Frontend (Pages)
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Compute (Workers & Pages)**.
2. Klik project **`ppdb-smp-yapia`**.
3. Buka tab **Custom domains** > klik tombol **Set up a custom domain**.
4. Ketik domain Anda (misal `ppdb.yapia.sch.id` atau `sipmb.yapia-ciputat.web.id`).
5. Jika domain menggunakan nameserver Cloudflare, DNS CNAME dan sertifikat SSL/HTTPS akan dikonfigurasi secara instan dan otomatis 100%.

### B. Menambah Custom Domain pada Backend (Workers)
1. Di dashboard yang sama, klik Worker **`sipmb-api`**.
2. Buka tab **Settings** > **Domains & Routes** > klik **Add** > pilih **Custom domain**.
3. Ketik subdomain API yang diinginkan (misal `api-ppdb.yapia-ciputat.web.id`).
4. Klik **Add domain**.

---

## 6. Monitoring & Troubleshooting

| Permasalahan | Penyebab Umum | Solusi |
|---|---|---|
| **Error `code: 10181`** | `database_id` di `wrangler.jsonc` salah atau tidak ditemukan di akun Cloudflare. | Jalankan `npx wrangler d1 list` untuk mengecek UUID asli database, lalu sesuaikan di `wrangler.jsonc`. |
| **`D1_ERROR: no such column`** | Kode backend memanggil kolom baru yang belum dieksekusi di database remote. | Jalankan `npx wrangler d1 execute yapia_sipmb_db --command="ALTER TABLE ... ADD COLUMN ..." --remote`. |
| **Perubahan Frontend Tidak Muncul** | Lupa melakukan build sebelum deploy, atau cache browser masih aktif. | Jalankan `pnpm deploy:frontend` (yang otomatis menjalankan build ulang), lalu refresh browser dengan `Ctrl + F5`. |
| **Error CORS di Browser** | URL backend tidak mengizinkan origin frontend atau URL `VITE_API_URL` salah. | Pastikan `VITE_API_URL` di frontend mengarah ke URL Worker aktif dan middleware `cors()` di `app.ts` aktif. |

### Membaca Log Produksi Secara Real-Time
Untuk mendiagnosis error pada backend saat diakses pengguna:
```powershell
cd apps/backend
npx wrangler tail
```
*(Seluruh error console, waktu eksekusi query D1, dan HTTP request yang masuk akan tercetak langsung di terminal Anda).*
