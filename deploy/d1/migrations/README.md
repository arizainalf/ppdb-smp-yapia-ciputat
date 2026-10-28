# Folder Migrasi Database Cloudflare D1
## SIPMB SMP YAPIA Ciputat

Folder ini digunakan untuk menyimpan file skrip SQL migrasi bertahap setiap kali ada perubahan struktur tabel di database Cloudflare D1 (`yapia_sipmb_db`).

### Format Penamaan File
Gunakan format urutan waktu / nomor versi:
* `0001_initial_schema.sql` (baseline)
* `0002_tambah_kolom_xyz.sql`
* `0003_tabel_pembayaran_infak.sql`

### Cara Eksekusi Migrasi ke Produksi
Dari root project:
```powershell
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/NAMA_FILE.sql --remote
```

Panduan lengkap mengenai tata cara migrasi, backup, dan rollback dapat dibaca di:
👉 [`docs/PANDUAN_MIGRASI_SCHEMA_DAN_DEPLOYMENT.md`](../../docs/PANDUAN_MIGRASI_SCHEMA_DAN_DEPLOYMENT.md)
