import { Context } from 'hono';

const TTL_SECONDS = 60;

/**
 * Cache respons GET di edge (Cloudflare Cache API) untuk menekan jumlah query
 * D1 pada endpoint publik yang datanya nyaris statis.
 *
 * Aturan:
 * - Hanya aktif di lingkungan Workers (Cache API tidak tersedia di Node lokal).
 * - Request yang menyertakan header Authorization (admin/panitia yang login)
 *   SELALU bypass cache agar selalu mendapat data terbaru.
 * - TTL pendek (60 detik) sebagai kompromi antara hemat kuota D1 dan kesegaran data.
 */
export async function withEdgeCache(
  c: Context,
  fetcher: () => Promise<Response>
): Promise<Response> {
  // Bypass: mode lokal (Node) atau request terautentikasi
  const cachesApi = (globalThis as any).caches;
  if (!cachesApi?.default || c.req.header('Authorization')) {
    return fetcher();
  }

  try {
    const cache = cachesApi.default as Cache;
    const key = new Request(c.req.url, { method: 'GET' });

    const cached = await cache.match(key);
    if (cached) {
      return cached;
    }

    const res = await fetcher();
    if (res.status === 200) {
      res.headers.set('Cache-Control', `public, max-age=${TTL_SECONDS}, s-maxage=${TTL_SECONDS}`);
      try {
        c.executionCtx.waitUntil(cache.put(key, res.clone()));
      } catch {
        // waitUntil tidak tersedia di beberapa adapter — abaikan, cache tetap tersimpan asinkron
        void cache.put(key, res.clone());
      }
    }
    return res;
  } catch {
    // Kegagalan cache tidak boleh menggagalkan endpoint — fallback ke D1 langsung
    return fetcher();
  }
}
