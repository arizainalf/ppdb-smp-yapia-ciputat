import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface D1QueryResult<T = unknown> {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export class D1Client {
  private readonly accountId: string;
  private readonly databaseId: string;
  private readonly apiToken: string;
  private localDb: DatabaseSync | null = null;
  private isUsingLocal: boolean = false;
  private binding: any = null;

  constructor() {
    this.accountId = (typeof process !== 'undefined' && process.env?.CLOUDFLARE_ACCOUNT_ID) || '';
    this.databaseId = (typeof process !== 'undefined' && process.env?.CLOUDFLARE_D1_DATABASE_ID) || '';
    this.apiToken = (typeof process !== 'undefined' && process.env?.CLOUDFLARE_API_TOKEN) || '';

    const hasValidCloudflareCreds =
      Boolean(this.accountId) &&
      Boolean(this.databaseId) &&
      Boolean(this.apiToken) &&
      !this.accountId.includes('contoh') &&
      !this.databaseId.includes('contoh');

    if (!hasValidCloudflareCreds && typeof process !== 'undefined' && process.versions?.node) {
      // Lazy init local DB saat dibutuhkan di lingkungan Node lokal
    }
  }

  public setBinding(binding: any): void {
    if (binding) {
      this.binding = binding;
      this.isUsingLocal = false;
    }
  }

  private initLocalDb(): DatabaseSync {
    if (this.localDb) return this.localDb;

    try {
      const projectRoot = process.cwd();
      const possibleDataDirs = [
        path.join(projectRoot, 'apps/backend/data'),
        path.join(projectRoot, 'data'),
        path.join(projectRoot, '.data'),
      ];

      let targetDir = possibleDataDirs[0];
      for (const d of possibleDataDirs) {
        if (fs.existsSync(path.dirname(d))) {
          targetDir = d;
          break;
        }
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const dbFile = path.join(targetDir, 'd1-local.sqlite');
      this.localDb = new DatabaseSync(dbFile);
      this.isUsingLocal = true;

      this.bootstrapSchemaAndSeed(this.localDb);

      console.log(`📦 [D1Client] Menggunakan database SQLite lokal: ${dbFile}`);
      return this.localDb;
    } catch (err: any) {
      console.warn(`⚠️ [D1Client] Gagal membuat file SQLite, fallback ke SQLite in-memory: ${err.message}`);
      this.localDb = new DatabaseSync(':memory:');
      this.isUsingLocal = true;
      this.bootstrapSchemaAndSeed(this.localDb);
      return this.localDb;
    }
  }

  private bootstrapSchemaAndSeed(db: DatabaseSync): void {
    try {
      const check = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='calon_siswa'").all();
      if (check.length === 0) {
        const possibleSchemaPaths = [
          path.resolve(process.cwd(), 'deploy/d1/schema.sql'),
          path.resolve(process.cwd(), '../../deploy/d1/schema.sql'),
          path.resolve(process.cwd(), '../deploy/d1/schema.sql'),
        ];
        const schemaPath = possibleSchemaPaths.find((p) => fs.existsSync(p));
        if (schemaPath) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          db.exec(schemaSql);
          console.log(`✅ [D1Client] Skema tabel D1 berhasil dimuat dari: ${schemaPath}`);
        }

        const possibleSeedPaths = [
          path.resolve(process.cwd(), 'deploy/d1/seed.sql'),
          path.resolve(process.cwd(), '../../deploy/d1/seed.sql'),
          path.resolve(process.cwd(), '../deploy/d1/seed.sql'),
        ];
        const seedPath = possibleSeedPaths.find((p) => fs.existsSync(p));
        if (seedPath) {
          const seedSql = fs.readFileSync(seedPath, 'utf8');
          db.exec(seedSql);
          console.log(`🌱 [D1Client] Data awal (seed) D1 berhasil diinjeksi dari: ${seedPath}`);
        }
      }

      // Pastikan tabel site_content selalu tersedia
      db.exec(`
        CREATE TABLE IF NOT EXISTS site_content (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_by TEXT
        );

        CREATE TABLE IF NOT EXISTS helpdesk_tickets (
          id TEXT PRIMARY KEY,
          ticket_number TEXT UNIQUE NOT NULL,
          nama_pengirim TEXT NOT NULL,
          no_whatsapp TEXT NOT NULL,
          email TEXT,
          kategori TEXT NOT NULL CHECK(kategori IN ('INFO_PENDAFTARAN', 'SYARAT_BERKAS', 'BIAYA_INFAK', 'JALUR_AFIRMASI_KIP', 'KENDALA_TEKNIS', 'LAINNYA')),
          subjek TEXT NOT NULL,
          pesan TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'MENUNGGU_RESPON' CHECK(status IN ('MENUNGGU_RESPON', 'SEDANG_DIPROSES', 'SELESAI')),
          tanggapan_panitia TEXT,
          ditanggapi_oleh TEXT,
          ditanggapi_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Migrasi 0002: kolom payment gateway (Tripay) pada pembayaran_pendaftaran
      const paymentColumns = ['pay_reference', 'checkout_url', 'pay_code', 'expired_at', 'catatan'];
      for (const col of paymentColumns) {
        try {
          db.exec(`ALTER TABLE pembayaran_pendaftaran ADD COLUMN ${col} TEXT;`);
        } catch {
          // Kolom sudah ada — aman diabaikan
        }
      }

      // Migrasi 0004: master data rekening bank
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS rekening_bank (
            id TEXT PRIMARY KEY,
            nama_bank TEXT NOT NULL,
            nomor_rekening TEXT NOT NULL,
            atas_nama TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
          );
        `);
        try {
          db.exec('ALTER TABLE pembayaran_pendaftaran ADD COLUMN rekening_id TEXT;');
        } catch {}
        const cnt = db.prepare('SELECT COUNT(*) as c FROM rekening_bank').all() as any[];
        if ((cnt[0]?.c ?? 0) === 0) {
          db.prepare(
            "INSERT INTO rekening_bank (id, nama_bank, nomor_rekening, atas_nama, is_active) VALUES ('rek-bsi-ppdb', 'Bank Syariah Indonesia (BSI)', '7211 8922 13', 'PANITIA PPDB SMP YAPIA CIPUTAT', 1)"
          ).run();
        }
      } catch (rekErr: any) {
        console.warn(`⚠️ [D1Client] Migrasi 0004 dilewati: ${rekErr.message}`);
      }

      // Migrasi 0003: tambah jenis berkas KTP_ORANG_TUA (rebuild CHECK constraint)
      try {
        const berkasSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='berkas_pendaftaran'").all() as any[];
        if (berkasSchema[0]?.sql && !String(berkasSchema[0].sql).includes('KTP_ORANG_TUA')) {
          db.exec('PRAGMA foreign_keys = OFF;');
          db.exec(`
            CREATE TABLE berkas_pendaftaran_new (
              id TEXT PRIMARY KEY,
              calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
              jenis_berkas TEXT NOT NULL CHECK(jenis_berkas IN ('IJAZAH_SKL', 'KARTU_KELUARGA', 'AKTA_KELAHIRAN', 'KTP_ORANG_TUA', 'FOTO', 'KIP_PIP', 'LAINNYA')),
              file_url TEXT NOT NULL,
              file_name TEXT NOT NULL,
              file_size_bytes INTEGER NOT NULL,
              mime_type TEXT NOT NULL,
              status_verifikasi TEXT NOT NULL DEFAULT 'PENDING' CHECK(status_verifikasi IN ('PENDING', 'VALID', 'INVALID')),
              catatan_verifikasi TEXT,
              created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            );
            INSERT INTO berkas_pendaftaran_new SELECT id, calon_siswa_id, jenis_berkas, file_url, file_name, file_size_bytes, mime_type, status_verifikasi, catatan_verifikasi, created_at FROM berkas_pendaftaran;
            DROP TABLE berkas_pendaftaran;
            ALTER TABLE berkas_pendaftaran_new RENAME TO berkas_pendaftaran;
          `);
          db.exec('PRAGMA foreign_keys = ON;');
          console.log('✅ [D1Client] Migrasi 0003 diterapkan: jenis berkas KTP_ORANG_TUA');
        }
      } catch (migrasiErr: any) {
        console.warn(`⚠️ [D1Client] Migrasi 0003 dilewati: ${migrasiErr.message}`);
      }

      // Migrasi 0006: kolom google_sub untuk Sign in with Google (SQLite melarang
      // UNIQUE pada ALTER TABLE ADD COLUMN, maka dibuat via unique index).
      // Catatan: ini hanya untuk SQLite lokal — D1 produksi memakai file
      // deploy/d1/migrations/0006_google_signin.sql.
      try {
        db.exec('ALTER TABLE users ADD COLUMN google_sub TEXT;');
        db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);');
        console.log('✅ [D1Client] Migrasi 0006 diterapkan: kolom users.google_sub');
      } catch {
        // Kolom/index sudah ada — aman diabaikan
      }
    } catch (bootstrapErr: any) {
      console.error(`⚠️ [D1Client] Gagal auto-bootstrap schema:`, bootstrapErr.message);
    }
  }

  public async query<T = unknown>(sql: string, params: unknown[] = []): Promise<D1QueryResult<T>> {
    // Normalisasi parameter untuk kompatibilitas SQLite
    const normalizedParams = params.map((p) => {
      if (typeof p === 'boolean') return p ? 1 : 0;
      if (p === undefined) return null;
      return p;
    });

    // 1. Eksekusi langsung jika berjalan di Cloudflare Workers dengan Native D1 Binding
    if (this.binding) {
      try {
        const stmt = this.binding.prepare(sql).bind(...normalizedParams);
        const cleanSql = sql.trim();
        const isSelect = /^(SELECT|PRAGMA)/i.test(cleanSql);

        if (isSelect) {
          const res = await stmt.all();
          return {
            results: (res.results || []) as T[],
            success: res.success ?? true,
            meta: res.meta,
          };
        } else {
          const res = await stmt.run();
          return {
            results: [],
            success: res.success ?? true,
            meta: {
              changes: res.meta?.changes ?? 0,
              last_row_id: Number(res.meta?.last_row_id || 0),
            },
          };
        }
      } catch (err: any) {
        console.error('❌ [D1Client] Native D1 Binding Query Error:', err.message);
        throw err;
      }
    }

    // 2. Jika berjalan di mode lokal atau kredensial Cloudflare belum disetel
    if (this.isUsingLocal || !this.accountId || !this.databaseId || !this.apiToken) {
      return this.queryLocal<T>(sql, normalizedParams);
    }

    // 3. Mode Cloudflare REST API (Node.js Server ke Cloudflare D1)
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params: normalizedParams }),
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 404 || res.status === 401 || res.status === 403) {
          console.warn(`⚠️ [D1Client] Cloudflare D1 HTTP Error (${res.status}). Mengalihkan query ke SQLite lokal.`);
          this.initLocalDb();
          return this.queryLocal<T>(sql, normalizedParams);
        }
        throw new Error(`Cloudflare D1 Query Error (${res.status}): ${errText}`);
      }

      const json = (await res.json()) as {
        success: boolean;
        result: Array<{ results: T[]; meta: Record<string, unknown> }>;
      };

      return {
        results: json.result?.[0]?.results ?? [],
        success: json.success,
        meta: json.result?.[0]?.meta,
      };
    } catch (err: any) {
      console.warn(`⚠️ [D1Client] Gagal menghubungi Cloudflare D1 (${err.message}). Beralih ke SQLite lokal.`);
      this.initLocalDb();
      return this.queryLocal<T>(sql, normalizedParams);
    }
  }

  private queryLocal<T = unknown>(sql: string, params: unknown[]): D1QueryResult<T> {
    const db = this.initLocalDb();
    const cleanSql = sql.trim();
    const isSelect = /^(SELECT|PRAGMA)/i.test(cleanSql);

    if (isSelect) {
      const stmt = db.prepare(cleanSql);
      const rows = stmt.all(...(params as any[])) as T[];
      return {
        results: rows,
        success: true,
        meta: { changes: 0 },
      };
    } else {
      const stmt = db.prepare(cleanSql);
      const info = stmt.run(...(params as any[]));
      return {
        results: [],
        success: true,
        meta: {
          changes: info.changes,
          last_row_id: Number(info.lastInsertRowid),
        },
      };
    }
  }
}

export const d1Client = new D1Client();
