# Dokumentasi Sistem Informasi Penerimaan Murid Baru (SIPMB)
## SMP YAPIA Ciputat

Selamat datang di repositori dokumentasi teknis dan spesifikasi sistem **SIPMB (Sistem Informasi Penerimaan Murid Baru) SMP YAPIA Ciputat**. Dokumentasi ini disusun secara komprehensif berdasarkan formulir pendaftaran fisik resmi SMP YAPIA Ciputat dan kebutuhan modernisasi proses admisi peserta didik baru.

---

### 📂 Daftar Dokumen Arsitektur & Spesifikasi

| No | Dokumen | Deskripsi Singkat | File Link |
|---|---|---|---|
| 1 | **Business Requirements Document (BRD)** | Latar belakang, profil sekolah, analisis AS-IS vs TO-BE, stakeholder matrix, aturan bisnis, dan KPI sistem. | [BRD_SIPMB_SMP_YAPIA.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/BRD_SIPMB_SMP_YAPIA.md) |
| 2 | **Product Requirements Document (PRD)** | User persona, functional & non-functional requirements, pemetaan field formulir fisik ke digital, dan user stories. | [PRD_SIPMB_SMP_YAPIA.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/PRD_SIPMB_SMP_YAPIA.md) |
| 3 | **Entity Relationship Diagram & Schema (ERD)** | Mermaid ERD, kamus data lengkap, constraints, indeks, DDL PostgreSQL siap pakai, dan seeder data contoh. | [ERD_DATABASE_SCHEMA.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/ERD_DATABASE_SCHEMA.md) |
| 4 | **System & Technical Architecture** | Arsitektur sistem (C4 model / High-level), tech stack rekomendasi, pola keamanan data pribadi, dan deployment guide. | [SYSTEM_ARCHITECTURE.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/SYSTEM_ARCHITECTURE.md) |
| 5 | **User Flow & UI/UX Specification** | State machine siklus pendaftaran, multi-step registration workflow, panduan UI, dan tata letak formulir pendaftaran. | [USER_FLOW_AND_UI_SPEC.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/USER_FLOW_AND_UI_SPEC.md) |
| 6 | **API Specification (RESTful)** | Kontrak API endpoint, autentikasi JWT/Session, schema payload request/response, dan status code handling. | [API_SPECIFICATION.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/API_SPECIFICATION.md) |
| 7 | **Test Plan & UAT Scenarios** | Rencana pengujian, matriks pengujian fungsional/keamanan, serta skenario User Acceptance Testing (UAT). | [TEST_PLAN_AND_UAT.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/TEST_PLAN_AND_UAT.md) |
| 8 | **Deployment & Infrastructure (Cloudflare Tunnel)** | Panduan deployment bebas port-forwarding, konfigurasi Docker Compose, zero trust access untuk BE, FE, DB, dan Vault. | [DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md) |
| 9 | **Software Architecture Patterns (Clean & Layered)** | Standar Clean Architecture pada Backend (Hono) dan Layered Architecture pada Frontend (React.js). | [SOFTWARE_ARCHITECTURE_PATTERNS.md](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/SOFTWARE_ARCHITECTURE_PATTERNS.md) |

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

### 🛠️ Panduan Pengembangan Singkat

1. **Prasyarat Sistem**:
   - Node.js v20+ / PHP 8.2+ / Go 1.22+
   - PostgreSQL 15+
   - Object Storage kompatibel S3 (MinIO / AWS S3 / Cloudflare R2)
   - Docker & Docker Compose
2. **Setup Skema Database**:
   - Jalankan DDL yang terdapat pada [`docs/ERD_DATABASE_SCHEMA.md`](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/ERD_DATABASE_SCHEMA.md#ddl-postgresql).
3. **Standar Penamaan**:
   - Database: `snake_case` (contoh: `nama_lengkap`, `sekolah_asal_id`)
   - API JSON: `camelCase` atau `snake_case` konsisten (standar JSend specification)
   - Dokumentasi: Markdown dengan Github Flavored Markdown (GFM) dan Mermaid diagram
