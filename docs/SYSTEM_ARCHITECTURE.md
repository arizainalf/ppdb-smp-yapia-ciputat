# System & Technical Architecture Document
## Sistem Informasi Penerimaan Murid Baru (SIPMB)
### SMP YAPIA Ciputat

---

| Informasi Dokumen | Keterangan |
|---|---|
| **Sistem** | SIPMB SMP YAPIA Ciputat |
| **Arsitektur Model** | Modular Layered Architecture / Containerized Micro-Monolith |
| **Status** | Disetujui untuk Desain Rekayasa Perangkat Lunak |
| **Target Lingkungan** | Linux Server (Ubuntu 22.04 LTS / Debian 12) via Docker Compose |

---

## 1. Ikhtisar Arsitektur Sistem (High-Level Architecture)

Arsitektur teknis SIPMB dirancang untuk menjamin kemudahan akses oleh orang tua siswa melalui perangkat *smartphone* (mobile-first), keandalan dan kecepatan respons bagi panitia PPDB, serta keamanan tingkat tinggi dalam melindungi data kependudukan anak di bawah umur sesuai **UU Perlindungan Data Pribadi (UU PDP No. 27/2022)**.

```mermaid
flowchart TB
    subgraph Clients [Klien Pengguna]
        UserMobile["📱 Orang Tua / Calon Siswa (Mobile Web PWA)"]
        AdminDesk["💻 Panitia PPDB / Kepsek / Bendahara (Desktop Backoffice)"]
    end

    subgraph EdgeTier [Edge & Reverse Proxy]
        CF["Cloudflare / Nginx Reverse Proxy\n(SSL TLS 1.3, DDoS Protection, Rate Limiter)"]
    end

    subgraph AppTier [Application Server - Dockerized / Edge]
        AppServer["SIPMB Core Engine\n(Hono Framework - TypeScript)\n- Auth JWT & RBAC Guard\n- Zod Form Validation\n- D1 Client & Drizzle ORM\n- Export Dapodik Formatter"]
        Worker["Background Queue Worker\n(Redis Queue / Worker)\n- PDF Registration Card Generator\n- WhatsApp Notification Dispatcher\n- Image Compressor & Thumbnailer"]
    end

    subgraph DataTier [Storage & Persistence Tier]
        DB[("Cloudflare D1 (Serverless Edge SQL)\n(SQLite Engine, ACID Relational,\nFree: 5M reads/day, 100k writes/day)")]
        RedisCache[("Redis 7.x\n(Session Store, Cache, Job Queue)")]
        S3Storage[("Cloudflare R2 / S3 Object Storage\n(Private Encrypted Bucket:\nIjazah SD, Kartu Keluarga, Akta)")]
    end

    subgraph ExternalServices [Layanan Eksternal]
        WAGw["📲 WhatsApp Gateway API\n(Fonnte / Wablas)"]
        Kemendikbud["🌐 Portal Resmi NISN / Verval PD Kemendikbud\n(Pencarian Web Resmi / Sinkronisasi Dapodik)"]
    end

    Clients -->|HTTPS:443| CF
    CF -->|Proxy Pass| AppServer
    AppServer -->|SQL Queries (D1 API / Binding)| DB
    AppServer -->|Cache & Dispatch Job| RedisCache
    AppServer -->|Presigned URL Upload/Download| S3Storage
    Worker -->|Fetch Jobs| RedisCache
    Worker -->|Read/Write File| S3Storage
    Worker -->|Send Notification| WAGw
    AppServer -.->|Shortcut Cek NISN Portal| Kemendikbud
```

> [!NOTE] Catatan Integrasi NISN Kemendikbudristek
> Kemendikbudristek **tidak menyediakan Open Public API gratis** yang dapat dipanggil langsung oleh aplikasi mandiri sekolah tanpa perjanjian kerja sama resmi (PKS/MoU). Oleh karena itu, validasi NISN pada SIPMB dilakukan secara bertingkat:
> 1. **Otomatis di Sistem**: Validasi format (tepat 10 digit numerik) dan validasi keunikan database pendaftaran.
> 2. **Verifikasi Operator**: Tautan pintas (*deep-link*) di dasbor panitia yang membuka portal resmi `nisn.data.kemdikbud.go.id` atau melalui menu *Tarik Peserta Didik* pada aplikasi Dapodik sekolah.

---

## 2. Pilihan Tumpukan Teknologi (Technology Stack)

| Lapisan (Layer) | Rekomendasi Teknologi | Justifikasi Teknis |
|---|---|---|
| **Frontend Framework** | **React.js (Vite) / Tailwind CSS** | - SPA murni sangat ringan tanpa beban server-side overhead.<br>- Kompilasi instan dengan Vite, mudah di-hosting sebagai static assets (Nginx / Cloudflare Pages).<br>- Responsif optimal di perangkat mobile calon orang tua murid (shadcn/ui, Radix UI). |
| **Backend & API** | **Hono Framework (TypeScript) / Drizzle ORM** | - Ultra-cepat, *lightweight* (~14KB footprint), dirancang khusus untuk ekosistem Cloudflare & Node.js.<br>- Validasi data formulir pendaftaran end-to-end yang ketat menggunakan `@hono/zod-validator`.<br>- Dukungan *native binding* terbaik untuk Cloudflare D1 dan R2. |
| **Database Relasional** | **Cloudflare D1 (Serverless SQLite)** | - Layanan database SQL gratis terkelola (kuota: 5 juta reads/hari, 100 ribu writes/hari, 5 GB storage).<br>- Menghilangkan kebutuhan hosting database lokal di server (hemat RAM dan disk).<br>- Terintegrasi dengan fitur otomatis *point-in-time recovery & backups*. |
| **Object Storage** | **Cloudflare R2 / AWS S3** | - Menghindari penyimpanan file fisik langsung di web server (mencegah *local file inclusion*).<br>- Mendukung *presigned URL* bertenggat waktu (15 menit) untuk keamanan dokumen pribadi. |
| **Cache & Queue** | **Redis 7.x** | - Penanganan *rate limiting* OTP/WhatsApp.<br>- Antrean *asynchronous* untuk *heavy-duty jobs* (pembuatan PDF bukti pendaftaran dan pengiriman notifikasi pesan). |
| **PDF & QR Engine** | **PDFKit / Puppeteer & QRCode Generator** | - Menghasilkan dokumen bukti formulir cetak PDF standar A4 dengan resolusi tajam dan QR Code terverifikasi. |
| **Infrastruktur & Deploy**| **Cloudflare Tunnel (`cloudflared`) & Docker** | - *Zero-Open-Ports* & *Zero-Cost*: Tidak perlu IP publik statis / port forwarding.<br>- Keamanan Zero Trust untuk dashboard admin dan Vault. |

---

## 3. Alur Komponen & Desain Data (Data & Component Flows)

### 3.1 Alur Unggah Berkas & Akses Terproteksi (Secure File Management)

Dokumen seperti Kartu Keluarga dan Akta Kelahiran merupakan data kependudukan sensitif. Sistem **dilarang** menyajikan file melalui URL publik statis yang dapat ditebak.

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Orang Tua / Pendaftar
    participant App as SIPMB API Backend
    participant Storage as MinIO / S3 Object Storage
    actor Admin as Panitia PPDB (Verifikator)

    Parent->>App: Unggah Scan Ijazah SD (Multipart File, Max 2MB)
    App->>App: Validasi Magic Byte MIME Type (image/jpeg, application/pdf)
    App->>App: Sanitasi Nama File & Hash UUID (mis: docs/2026/g1/uuid-ijazah.pdf)
    App->>Storage: Simpan file ke Private Bucket (Non-Public)
    Storage-->>App: Konfirmasi File Tersimpan
    App->>App: Simpan Metadata ke tabel `berkas_pendaftaran`
    App-->>Parent: Respon Sukses (File Terlampir)

    Note over Admin,Storage: Saat Panitia Memeriksa Berkas di Dasbor
    Admin->>App: Buka Halaman Verifikasi Calon Siswa (Token Admin Valid)
    App->>Storage: Generate Presigned URL (Expired in 15 Minutes)
    Storage-->>App: Temporary Signed URL (https://s3.yapia.sch.id/...&token=xyz)
    App-->>Admin: Tampilkan Preview Gambar/PDF via Temporary Presigned URL
```

---

### 3.2 Alur Pembuatan Bukti Pendaftaran & Validasi QR Code

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Pendaftar
    participant App as SIPMB Backend
    participant Worker as Background PDF Worker
    actor Panitia as Panitia di Meja Registrasi Ulang

    Parent->>App: Klik "Download Bukti Pendaftaran"
    App->>Worker: Antrekan Tugas Pembuatan PDF (calon_siswa_id)
    Worker->>Worker: Buat Signed QR Code: https://ppdb.smp-yapia.sch.id/verify/{nomor_pendaftaran}
    Worker->>Worker: Render Template Formulir Resmi PDF (Data A, B, C, D)
    Worker-->>App: File PDF Selesai Disiapkan
    App-->>Parent: Download `Bukti_Pendaftaran_REG-2026-G1-0003.pdf`

    Note over Parent,Panitia: Pada Hari Verifikasi Fisik / Orientasi Sekolah
    Parent->>Panitia: Menunjukkan Lembar Cetak Bukti Pendaftaran
    Panitia->>Panitia: Scan QR Code menggunakan Kamera HP / Barcode Scanner
    Panitia->>App: Akses Halaman Verifikasi Cepat
    App-->>Panitia: Tampilkan Status Keaslian Data: "RESMI TERVERIFIKASI - ALKA ALHABSY"
```

---

## 4. Arsitektur Keamanan (Security Architecture)

1. **Proteksi Akses (Authentication & Authorization)**:
   - Akses berbasis peran (*Role-Based Access Control* - RBAC): `SUPERADMIN`, `PANITIA_VERIFIKATOR`, `BENDAHARA`, `KEPALA_SEKOLAH`, `PENDAFTAR`.
   - Menggunakan token terenkripsi (JWT dengan masa kedaluwarsa pendek) atau *HttpOnly Secure SameSite Cookie* untuk mencegah *Cross-Site Scripting (XSS)*.
2. **Perlindungan Terhadap Serangan Web (OWASP Top 10)**:
   - **SQL Injection**: Dicegah dengan penggunaan ORM (Prisma / Drizzle / Eloquent) dengan *parameterized queries* bawaan.
   - **Cross-Site Request Forgery (CSRF)**: Dilindungi token CSRF pada setiap operasi mutasi (POST/PUT/DELETE).
   - **Rate Limiting**: Maksimal 10 percobaan login per menit per IP untuk mencegah *brute-force*, dan maksimal 3 permintaan OTP WhatsApp per 10 menit.
3. **Pengerasan Upload File (File Upload Hardening)**:
   - File tidak dieksekusi di server (disimpan di Object Storage terpisah).
   - Validasi ganda: ekstensi file dan *magic bytes header* file.
   - Batas ketat ukuran file: maksimal 2.097.152 bytes (2 MB).
4. **Enkripsi Data Sensitif (Data Encryption)**:
   - Enkripsi transmisi data via HTTPS / TLS 1.3.
   - Kolom sensitif seperti nomor kontak keluarga dan catatan kesehatan dienkripsi menggunakan AES-256 pada level basis data.

---

## 5. Strategi Deployment & Infrastruktur (Docker Containerization)

> [!TIP] Panduan Praktis Deployment Cloudflare Tunnel (Free Tier)
> Untuk panduan implementasi lengkap arsitektur tanpa IP publik menggunakan **Cloudflare Tunnel (`cloudflared`)** mencakup Frontend, Backend, Database, dan HashiCorp Vault, silakan merujuk ke dokumen khusus:
> 🔗 [`docs/DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md`](file:///home/arizainalf/Project/smp-yapia-ciputat/docs/DEPLOYMENT_INFRASTRUCTURE_CLOUDFLARE.md).

Sistem dirancang untuk dijalankan menggunakan arsitektur container Docker Compose multi-layanan:

```yaml
# Ilustrasi docker-compose.yml arsitektur produksi SIPMB SMP YAPIA
version: '3.8'

services:
  reverse-proxy:
    image: nginx:alpine
    container_name: yapia_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/conf:/etc/letsencrypt
    depends_on:
      - sipmb-app

  sipmb-app:
    build: .
    container_name: yapia_sipmb_app
    restart: always
    environment:
      - DATABASE_URL=postgresql://yapia_user:strong_password@postgres:5432/yapia_sipmb
      - REDIS_URL=redis://redis:6379
      - S3_ENDPOINT=http://minio:9000
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    container_name: yapia_postgres
    restart: always
    environment:
      POSTGRES_DB: yapia_sipmb
      POSTGRES_USER: yapia_user
      POSTGRES_PASSWORD: strong_password
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: yapia_redis
    restart: always

  minio:
    image: minio/minio
    container_name: yapia_minio
    command: server /data --console-address ":9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  miniodata:
```

### Kebijakan Pencadangan (Backup Strategy):
- **Database Dump**: Backup otomatis setiap malam pukul 02:00 WIB via *cron job* (`pg_dump -Fc`), dikompresi, dan diunggah ke *offsite backup storage* dengan retensi 30 hari.
- **Berkas Upload**: Fitur *versioning* dan *bucket replication* pada MinIO/S3 ke *secondary storage node*.
