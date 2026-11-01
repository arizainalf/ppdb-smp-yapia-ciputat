import { Context, Next } from 'hono';

// =====================================================================
// RATE LIMITING MIDDLEWARE
// ---------------------------------------------------------------------
// Strategi berlapis sesuai plan Cloudflare:
// 1. Workers Paid  : gunakan binding `ratelimit` (env.RATE_LIMITER)
//                    — add di wrangler.jsonc:
//                      "ratelimit": [{ "name": "RATE_LIMITER",
//                                      "namespace_id": "<id-unik>" }]
// 2. Free plan     : fallback penghitung fixed-window di memori per
//                    isolate Worker. Tidak persisten antar isolate,
//                    tetapi efektif memutus lonjakan dari satu klien
//                    dan TANPA biaya kuota (KV tidak dipakai karena
//                    kuota write KV free hanya 1.000/hari — rate limit
//                    per request akan meledakkan kuota itu).
// =====================================================================

export interface RateLimitOptions {
  /** Cakupan pembatas (mis. 'global', 'search', 'auth') — memisahkan bucket */
  scope: string;
  /** Maksimum request dalam satu window */
  limit: number;
  /** Panjang window dalam detik */
  windowSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

// Penyimpanan in-memory per isolate (fallback free plan)
const memoryBuckets = new Map<string, Bucket>();

// Pembersihan bucket kedaluwarsa agar memori tidak membengkak
function sweepMemory(now: number) {
  if (memoryBuckets.size < 10_000) return;
  for (const [k, b] of memoryBuckets) {
    if (b.resetAt <= now) memoryBuckets.delete(k);
  }
}

function getEnv(c: Context, key: string): string | undefined {
  return ((c.env as any)?.[key] as string | undefined) || process.env?.[key];
}

function clientIp(c: Context): string {
  return c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

async function checkRate(c: Context, opts: RateLimitOptions): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  const ip = clientIp(c);
  const now = Date.now();
  const windowId = Math.floor(now / (opts.windowSeconds * 1000));
  const resetAt = (windowId + 1) * opts.windowSeconds * 1000;
  const key = `rl:${opts.scope}:${ip}:${windowId}`;

  // 1. Worker Rate Limiting Binding (Workers Paid) — akurat & terdistribusi
  const limiter = (c.env as any)?.RATE_LIMITER;
  if (limiter && typeof limiter.limit === 'function') {
    try {
      const res = await limiter.limit({ key: `${opts.scope}:${ip}` });
      return { ok: Boolean(res.success), remaining: 0, resetAt };
    } catch {
      // Binding error → fallback ke memori agar endpoint tidak mati
    }
  }

  // 2. Fixed window in-memory (free plan)
  sweepMemory(now);
  const bucket = memoryBuckets.get(key);
  if (!bucket) {
    memoryBuckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: opts.limit - 1, resetAt };
  }
  bucket.count += 1;
  return { ok: bucket.count <= opts.limit, remaining: Math.max(0, opts.limit - bucket.count), resetAt: bucket.resetAt };
}

export function rateLimit(opts: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    // Batas bisa disetel via env tanpa redeploy kode
    const limitOverride = Number(getEnv(c, `RATE_LIMIT_${opts.scope.toUpperCase()}`)) || opts.limit;

    const result = await checkRate(c, { ...opts, limit: limitOverride });
    if (!result.ok) {
      const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
      c.header('Retry-After', String(retryAfterSec));
      c.header('X-RateLimit-Limit', String(limitOverride));
      c.header('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
      return c.json(
        {
          status: 'fail',
          message: `Terlalu banyak permintaan. Silakan coba lagi dalam ${retryAfterSec} detik.`,
        },
        429
      );
    }

    c.header('X-RateLimit-Limit', String(limitOverride));
    c.header('X-RateLimit-Remaining', String(result.remaining));
    await next();
  };
}

/** Preset: batas umum untuk seluruh API (default 60 req/menit/IP) */
export function generalRateLimit() {
  return rateLimit({ scope: 'global', limit: 60, windowSeconds: 60 });
}

/** Preset: batas ketat untuk endpoint berat yang memukul D1 (default 10 req/menit/IP) */
export function heavyRateLimit(scope = 'heavy') {
  return rateLimit({ scope, limit: 10, windowSeconds: 60 });
}
