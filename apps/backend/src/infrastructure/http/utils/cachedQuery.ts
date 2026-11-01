import { Context } from 'hono';
import { d1Client, D1QueryResult } from '../../database/d1Client.js';

// =====================================================================
// D1 CACHED QUERY — wrapper cache untuk query SELECT D1 (level data)
// ---------------------------------------------------------------------
// Berbeda dari `withEdgeCache` (yang menyimpan respons HTTP utuh),
// helper ini menyimpan HASIL QUERY ke Workers Cache API agar bisa
// dipakai ulang di beberapa endpoint/route dalam satu TTL.
//
// - Aktif otomatis hanya di Workers (Cache API tidak ada di Node lokal).
// - Key harus unik per variasi query (sertakan parameter penting).
// - HANYA untuk query baca (SELECT) yang tidak berubah tiap detik.
// =====================================================================

const CACHE_HOST = 'https://d1-cache.internal';

export async function cachedQuery<T>(
  _c: Context,
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<D1QueryResult<T>>
): Promise<D1QueryResult<T>> {
  const cachesApi = (globalThis as any).caches;
  if (!cachesApi?.default) {
    return fetcher(); // mode lokal Node — langsung ke D1
  }

  try {
    const cache = cachesApi.default as Cache;
    const cacheKey = new Request(`${CACHE_HOST}/${encodeURIComponent(key)}`, { method: 'GET' });

    const cached = await cache.match(cacheKey);
    if (cached) {
      const rows = (await cached.json()) as D1QueryResult<T>;
      if (Array.isArray(rows?.results)) return rows;
    }

    const fresh = await fetcher();

    const serializable: D1QueryResult<T> = { results: fresh.results, success: true, meta: { cached: true } };
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(serializable), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${Math.min(Math.max(ttlSeconds, 60), 3600)}`, // clamp 1-60 menit
        },
      })
    );
    return fresh;
  } catch {
    return fetcher(); // kegagalan cache tidak boleh menggagalkan query
  }
}

/** utilitas pembuat key cache sederhana dari SQL + params */
export function queryCacheKey(prefix: string, params: unknown[]): string {
  return `${prefix}:${params.map((p) => String(p)).join('|')}`;
}

// re-export agar pemanggil tidak perlu import d1Client terpisah
export { d1Client };
