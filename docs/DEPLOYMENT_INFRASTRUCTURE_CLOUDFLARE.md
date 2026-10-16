# Strategi Deployment & Infrastruktur SIPMB SMP YAPIA
## Cloudflare Ecosystem: Cloudflare Tunnel + Cloudflare D1 (Free Tier)

Dokumen ini menjelaskan arsitektur deployment, topologi jaringan, konfigurasi Docker Compose, serta panduan implementasi infrastruktur menggunakan **Cloudflare Tunnel (`cloudflared`) Free Tier** dikombinasikan dengan **Cloudflare D1 (Serverless SQL Database - Free Tier)** untuk **Frontend (FE)**, **Backend (BE)**, **Database (Cloudflare D1)**, dan **Vault (HashiCorp Vault)**.

---

## 1. Keunggulan Arsitektur Hybrid Cloudflare D1

Dengan mengalihkan database dari PostgreSQL lokal ke **Cloudflare D1**:

1. **Bebas Beban Server & Hemat RAM**:
   - Database tidak lagi berjalan sebagai kontainer PostgreSQL di host server. Menghemat 300MB - 500MB RAM server.
   - Tidak ada risiko korupsi disk lokal atau kehabisan ruang penyimpanan akibat volume database.
2. **Kapasitas Kuota Free Tier Cloudflare D1**:
   - **5.000.000 baris pembacaan (rows read) per hari** (sangat lebih dari cukup untuk trafik PPDB sekolah).
   - **100.000 baris penulisan (rows write) per hari**.
   - **5 GB kapasitas penyimpanan SQL** (cukup untuk ratusan ribu data formulir pendaftaran teks).
   - **Auto Backup**: Pencadangan otomatis terkelola (point-in-time recovery) langsung oleh Cloudflare.
3. **Database Studio Bawaan di Dashboard Cloudflare**:
   - Tidak perlu menginstal Web Database GUI tambahan (seperti pgAdmin / CloudBeaver). Anda bisa mengelola tabel, menjalankan query SQL, dan mengekspor data langsung dari menu **Storage & Databases &rarr; D1** di Cloudflare Dashboard.
4. **Keamanan Maksimal**:
   - Akses D1 dikontrol melalui **Cloudflare API Token** dengan izin granular (*D1 Edit*).
   - Kredensial API Token disimpan aman di dalam **HashiCorp Vault**.

---

## 2. Topologi Jaringan & Diagram Arsitektur

```mermaid
flowchart TB
    subgraph InternetZone ["🌐 Internet Publik & Klien"]
        User["📱 Pendaftar / Orang Tua (Publik)"]
        Admin["💻 Panitia PPDB / Kepsek"]
    end

    subgraph CloudflareEdge ["☁️ Cloudflare Global Edge Ecosystem (Free Tier)"]
        CF_DNS["Cloudflare DNS"]
        CF_WAF["Cloudflare WAF & DDoS Shield"]
        CF_Access["Cloudflare Zero Trust Access (Free s/d 50 User)\n(Verifikasi OTP Email Admin)"]
        
        subgraph CloudflareD1Zone ["🗄️ Cloudflare D1 (Serverless Edge SQL)"]
            D1[("Cloudflare D1 SQLite Database\n- yapia_sipmb_db\n- Free: 5M reads/day, 100k writes/day\n- Managed Auto Backups")]
            D1Studio["🖥️ Cloudflare D1 Studio (Web GUI Bawaan)"]
        end
    end

    subgraph HostServer ["🖥️ Host Server (On-Premise / VPS)"]
        CFTunnel["🐳 container: cloudflared\n(Outbound Daemon Tunnel ke Cloudflare)"]

        subgraph DockerNetwork ["Docker Private Bridge (yapia-network)"]
            FE["🐳 container: frontend\n(React.js SPA + Vite / Port 3000)"]
            BE["🐳 container: backend\n(Hono API Framework / Port 8000)"]
            Vault["🐳 container: vault\n(HashiCorp Vault / Port 8200)"]
            Redis[("🐳 container: redis\n(Redis 7 Cache & Queue / Port 6379)")]
        end

        Volumes[("Persistent Volumes:\n- vaultdata\n- redisdata")]
    end

    %% Rute Akses Publik
    User -->|HTTPS ppdb.yapia.sch.id| CF_DNS --> CF_WAF --> CFTunnel --> FE
    User & Admin -->|HTTPS api-ppdb.yapia.sch.id| CF_DNS --> CF_WAF --> CFTunnel --> BE

    %% Rute Akses Terproteksi (Admin Vault & D1)
    Admin -->|HTTPS vault.yapia.sch.id| CF_Access --> CFTunnel --> Vault
    Admin -->|Kelola DB via Cloudflare Dashboard| D1Studio --> D1

    %% Koneksi Internal Aplikasi
    FE -.->|API Fetch (JSON)| BE
    BE -->|Ambil Kredensial D1 & JWT (Internal)| Vault
    BE -->|HTTPS REST API / Cloudflare D1 Client| D1
    BE -->|Cache & WhatsApp Queue| Redis
```

---

## 3. Matriks Layanan & Kebijakan Akses

| Komponen | Framework / Engine | Domain / Rute | Kebijakan Keamanan |
|---|---|---|---|
| **Frontend (FE)** | **React.js (Vite)** SPA | `ppdb.yapia.sch.id` | **Public Ingress** via Cloudflare Tunnel. Caching aset statis (HTML/JS/CSS) di CDN Cloudflare. |
| **Backend (BE)** | **Hono Framework** (TypeScript) | `api-ppdb.yapia.sch.id` | **Public Ingress** via Cloudflare Tunnel. WAF & rate limiting bawaan Cloudflare. |
| **Database (DB)** | **Cloudflare D1** (Serverless SQLite) | Cloudflare Edge | **Cloudflare API / Native Binding**. Autentikasi dengan Bearer Token via HTTPS. Terkelola otomatis tanpa port database terbuka. |
| **Secret Manager** | **HashiCorp Vault** | `vault.yapia.sch.id` | **Cloudflare Zero Trust Access**. Hanya dapat dibuka setelah verifikasi OTP email admin. |
| **Cache & Queue** | **Redis 7** | Internal `redis:6379` | **Terisolasi 100%** di dalam Docker Bridge Network. |

---

## 4. Dua Opsi Eksekusi Backend Hono dengan Cloudflare D1

### Opsi A: Hono di Docker Container (Node.js / Bun) via Cloudflare D1 HTTP API
Backend Hono berjalan di dalam container Docker server lokal/VPS, dan berkomunikasi dengan Cloudflare D1 melalui D1 REST API Client:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono();

app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok', service: 'SIPMB Hono API' }));

// Contoh Endpoint Pendaftaran Siswa
const pendaftaranSchema = z.object({
  nama_lengkap: z.string().min(3),
  no_hp: z.string().regex(/^08[0-9]{8,11}$/),
  nisn: z.string().length(10),
  gelombang_id: z.number().int(),
});

app.post('/api/pendaftaran', zValidator('json', pendaftaranSchema), async (c) => {
  const data = c.req.valid('json');
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  // Query langsung ke Cloudflare D1 HTTP API
  const d1Res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `INSERT INTO calon_siswa (id, user_id, gelombang_id, nomor_pendaftaran, nama_lengkap, status_pendaftaran) 
              VALUES (?, ?, ?, ?, ?, 'DRAFT') RETURNING id, nomor_pendaftaran`,
        params: [crypto.randomUUID(), 'user-id-demo', data.gelombang_id, 'REG-2026-G1-0001', data.nama_lengkap],
      }),
    }
  );

  const result = await d1Res.json();
  return c.json({ success: true, data: result }, 201);
});

export default app;
```

### Opsi B: Hono di Cloudflare Workers (100% Serverless Edge)
Jika ingin backend tanpa beban server sama sekali, Hono dapat di-deploy langsung ke Cloudflare Workers dengan binding D1 native (`c.env.DB`):

```typescript
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/gelombang', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM gelombang_pendaftaran WHERE is_active = 1'
  ).all();
  return c.json(results);
});
```

---

## 5. DDL Skema SQLite untuk Cloudflare D1

Karena Cloudflare D1 berbasis SQLite, tipe data disesuaikan:
- `UUID` &rarr; `TEXT`
- `TIMESTAMP` &rarr; `TEXT` (ISO 8601 UTC: `strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`)
- `BOOLEAN` &rarr; `INTEGER` (`0` atau `1`)
- `DECIMAL` &rarr; `INTEGER` (nilai rupiah dalam satuan bulat)
- `JSONB` &rarr; `TEXT`
- `ENUM` &rarr; `TEXT CHECK (...)`

File DDL lengkap tersedia di: [`deploy/d1/schema.sql`](file:///home/arizainalf/Project/smp-yapia-ciputat/deploy/d1/schema.sql).

---

## 6. Panduan Setup Cloudflare D1 & Tunnel Langkah-demi-Langkah

### Langkah 1: Buat Database D1 di Cloudflare Dashboard
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Pada menu navigasi kiri, pilih **Storage & Databases** &rarr; **D1**.
3. Klik **Create database** &rarr; Beri nama: `yapia_sipmb_db`.
4. Salin **Database ID** dan **Account ID** Anda.

### Langkah 2: Buat Cloudflare API Token
1. Di pojok kanan atas Cloudflare Dashboard, klik profil Anda &rarr; **My Profile** &rarr; **API Tokens**.
2. Klik **Create Token** &rarr; Pilih template **Custom Token**.
3. Beri nama: `SIPMB_D1_Access_Token`.
4. Permissions:
   - **Account** &rarr; **D1** &rarr; **Edit**
5. Klik **Continue to summary** &rarr; **Create Token**.
6. Simpan token ini (hanya ditampilkan sekali!).

### Langkah 3: Eksekusi Migrasi Skema ke Cloudflare D1
Anda dapat mengeksekusi DDL skema menggunakan Cloudflare Wrangler CLI di laptop/server:
```bash
# Login ke Cloudflare
npx wrangler login

# Jalankan skema ke D1 produksi
npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/schema.sql --remote
```
Atau langsung salin isi [`deploy/d1/schema.sql`](file:///home/arizainalf/Project/smp-yapia-ciputat/deploy/d1/schema.sql) ke tab **Console** di dashboard D1 Cloudflare!

### Langkah 4: Buat Cloudflare Tunnel
1. Buka **Cloudflare One / Zero Trust** (`dash.teams.cloudflare.com`).
2. Masuk ke **Networks** &rarr; **Tunnels** &rarr; **Create a Tunnel** (`yapia-core-server`).
3. Salin **Tunnel Token** ke `.env` pada variabel `CLOUDFLARE_TUNNEL_TOKEN`.
4. Di tab **Public Hostname**, tambahkan rute:
   - `ppdb.yapia.sch.id` &rarr; `http://frontend:3000`
   - `api-ppdb.yapia.sch.id` &rarr; `http://backend:8000`
   - `vault.yapia.sch.id` &rarr; `http://vault:8200`

### Langkah 5: Lindungi Vault dengan Cloudflare Zero Trust Access
1. Di Dashboard Zero Trust, masuk ke **Access** &rarr; **Applications** &rarr; **Add an Application** &rarr; **Self-hosted**.
2. Masukkan domain `vault.yapia.sch.id`.
3. Buat policy: **Include Emails** &rarr; masukkan email admin/developer Anda.
4. Sekarang, hanya Anda yang dapat membuka dashboard Vault via verifikasi kode OTP email!

### Langkah 6: Jalankan Stack Docker
```bash
cd deploy
cp .env.example .env
# Masukkan CLOUDFLARE_TUNNEL_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN
docker compose up -d
```
