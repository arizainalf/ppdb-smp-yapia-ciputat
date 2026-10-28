# Dokumentasi Sistem Informasi Penerimaan Murid Baru (SIPMB)
## SMP YAPIA Ciputat

Selamat datang di repositori dokumentasi teknis dan spesifikasi sistem **SIPMB (Sistem Informasi Penerimaan Murid Baru) SMP YAPIA Ciputat**. Dokumentasi ini disusun secara komprehensif berdasarkan formulir pendaftaran fisik resmi SMP YAPIA Ciputat dan kebutuhan modernisasi proses admisi peserta didik baru.

---

### 📂 Daftar Dokumen Arsitektur & Spesifikasi

| No | Dokumen | Deskripsi Singkat | File Link |
|---|---|---|---|
| 1 | **Business Requirements Document (BRD)** | Latar belakang, profil sekolah, analisis AS-IS vs TO-BE, stakeholder matrix, aturan bisnis, dan KPI sistem. | [BRD_SIPMB_SMP_YAPIA.md](BRD_SIPMB_SMP_YAPIA.md) |
| 2 | **Product Requirements Document (PRD)** | User persona, functional & non-functional requirements, pemetaan field formulir fisik ke digital, dan user stories. | [PRD_SIPMB_SMP_YAPIA.md](PRD_SIPMB_SMP_YAPIA.md) |
| 3 | **Entity Relationship Diagram & Schema (ERD)** | Mermaid ERD, kamus data lengkap, constraints, indeks, DDL PostgreSQL/SQLite, dan seeder data contoh. | [ERD_DATABASE_SCHEMA.md](ERD_DATABASE_SCHEMA.md) |
| 4 | **System & Technical Architecture** | Arsitektur sistem (C4 model / High-level), tech stack rekomendasi, pola keamanan data pribadi, dan deployment guide. | [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) |
| 5 | **User Flow & UI/UX Specification** | State machine siklus pendaftaran, multi-step registration workflow, panduan UI, dan tata letak formulir pendaftaran. | [USER_FLOW_AND_UI_SPEC.md](USER_FLOW_AND_UI_SPEC.md) |
| 6 | **API Specification (RESTful)** | Kontrak API endpoint, autentikasi JWT/Session, schema payload request/response, dan status code handling. | [API_SPECIFICATION.md](API_SPECIFICATION.md) |
| 7 | **Test Plan & UAT Scenarios** | Rencana pengujian, matriks pengujian fungsional/keamanan, serta skenario User Acceptance Testing (UAT). | [TEST_PLAN_AND_UAT.md](TEST_PLAN_AND_UAT.md) |
| 8 | **Deployment & Infrastructure (Cloudflare Tunnel)** | Panduan deployment server lokal via Cloudflare Tunnel untuk Vault & container internal. | [DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md](DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md) |
| 9 | **Software Architecture Patterns (Clean & Layered)** | Standar Clean Architecture pada Backend (Hono) dan Layered Architecture pada Frontend (React.js). | [SOFTWARE_ARCHITECTURE_PATTERNS.md](SOFTWARE_ARCHITECTURE_PATTERNS.md) |
| 10 | **Panduan Migrasi Schema D1 & Deployment Produksi (SOP)** | Prosedur penambahan kolom/tabel baru di Cloudflare D1, backup database, alur build-deploy via Wrangler, dan custom domain. | [PANDUAN_MIGRASI_SCHEMA_DAN_DEPLOYMENT.md](PANDUAN_MIGRASI_SCHEMA_DAN_DEPLOYMENT.md) |
| 11 | **Runbook Deployment Produksi (Persiapan → Selesai)** | Checklist end-to-end: prasyarat, secret (JWT/Tripay), migrasi database (0002, 0003), deploy, konfigurasi callback Tripay, uji acceptance, go-live, dan rollback. | [RUNBOOK_DEPLOY_PRODUKSI.md](RUNBOOK_DEPLOY_PRODUKSI.md) |

---

### 📋 Ringkasan Data Formulir Fisik yang Diadopsi

Seluruh struktur data dalam sistem SIPMB diturunkan langsung dari formulir resmi pendaftaran:
- **Bagian A: Keterangan Calon Siswa** (Nama lengkap sesuai ijazah SD, tempat/tanggal lahir, agama, jenis kelamin, nomor HP).
- **Bagian B: Keterangan Pendidikan Sebelumnya** (Nama & alamat SD asal, NISN 10 digit, tinggi/berat badan, golongan darah).
- **Bagian C: Keterangan Tempat Tinggal** (Alamat, RT/RW, No. rumah, Kelurahan, Kecamatan, Kode Pos, No. telepon, status tinggal bersama).
- **Bagian D: Keterangan Orang Tua / Wali** (Nama sesuai ijazah, pendidikan terakhir, tahun lahir, pekerjaan, penghasilan bulanan untuk Ayah, Ibu, dan Wali).
- **Lampiran Wajib**: Scan/Foto Ijazah SD / Surat Keterangan Lulus (SKL), Kartu Keluarga (KK), dan Akta Kelahiran.
- **Validasi Panitia**: Penomoran formulir, verifikasi berkas, tanda tangan digital/persetujuan, dan pencetakan bukti pendaftaran ber-barcode/QR Code.

---

### 🛠️ Panduan Pengembangan & Deployment Cepat

1. **Prasyarat Sistem**:
   - Node.js v20+ / pnpm v9+
   - Akun Cloudflare aktif terautentikasi via `wrangler`
2. **Setup Skema Database Cloudflare D1**:
   - Skema DDL SQLite master tersedia di [`deploy/d1/schema.sql`](../deploy/d1/schema.sql).
   - Eksekusi ke remote D1: `npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/schema.sql --remote`.
3. **Perintah Deploy Otomatis (Monorepo Root)**:
   - Deploy Frontend: `pnpm deploy:frontend`
   - Deploy Backend: `pnpm deploy:backend`
   - Deploy Keduanya: `pnpm deploy:all`
