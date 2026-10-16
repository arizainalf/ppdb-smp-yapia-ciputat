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

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || '';
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';

    const hasValidCloudflareCreds =
      Boolean(this.accountId) &&
      Boolean(this.databaseId) &&
      Boolean(this.apiToken) &&
      !this.accountId.includes('contoh') &&
      !this.databaseId.includes('contoh');

    if (!hasValidCloudflareCreds) {
      this.initLocalDb();
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

    // Jika berjalan di mode lokal atau kredensial Cloudflare belum disetel
    if (this.isUsingLocal || !this.accountId || !this.databaseId || !this.apiToken) {
      return this.queryLocal<T>(sql, normalizedParams);
    }

    // Mode Cloudflare REST API (Production / Deployed)
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
        // Jika Cloudflare mengembalikan 404 (object identifier invalid) atau 401/403 karena token belum ada,
        // alihkan ke lokal secara mulus agar pengembang tidak terhalang
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
