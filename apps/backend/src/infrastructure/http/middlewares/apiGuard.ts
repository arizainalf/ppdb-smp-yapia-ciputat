import { Context, Next } from 'hono';

// =====================================================================
// API GUARD — proteksi endpoint Worker dari akses langsung (curl/bot)
// ---------------------------------------------------------------------
// Request DIIZINKAN bila salah satu terpenuhi:
//   1. Header `Origin` atau `Referer` berasal dari domain frontend resmi
//      (ALLOWED_ORIGINS, koma terpisah) — semua browser mengirim ini
//      untuk request lintas-origin (pages.dev -> workers.dev).
//   2. Header `X-Requested-With: XMLHttpRequest` (dikirim oleh apiClient React).
//   3. Header `Authorization: Bearer ...` (panitia/admin terautentikasi).
//
// DILEWATI (whitelist): preflight CORS (OPTIONS), /health (monitoring),
// dan callback webhook Tripay (server-to-server tanpa Origin).
//
// Matikan lewat env `API_GUARD=off` (berguna saat uji manual via curl/Postman).
// =====================================================================

const ALWAYS_ALLOWED_PREFIXES = [
  '/api/v1/pembayaran/tripay/callback', // webhook Tripay (server-to-server)
];

function getEnv(c: Context, key: string): string | undefined {
  return ((c.env as any)?.[key] as string | undefined) || process.env?.[key];
}

function allowedOrigins(c: Context): Set<string> {
  const raw =
    getEnv(c, 'ALLOWED_ORIGINS') ||
    [
      'https://ppdb-smp-yapia.pages.dev',
      'https://ppdb-smp-yapia.pages.dev',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ].join(',');
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
  );
}

function extractHost(headerValue?: string): string | null {
  if (!headerValue) return null;
  try {
    return new URL(headerValue).origin.replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function apiGuard() {
  return async (c: Context, next: Next) => {
    // 0. Sakelar on/off via env
    if ((getEnv(c, 'API_GUARD') || 'on').toLowerCase() === 'off') {
      return next();
    }

    // 1. Whitelist: preflight, health check, webhook
    if (c.req.method === 'OPTIONS') return next();
    const path = new URL(c.req.url).pathname;
    if (path === '/health') return next();
    if (ALWAYS_ALLOWED_PREFIXES.some((p) => path.startsWith(p))) return next();

    // 2. Authorization (panitia/admin terautentikasi)
    const auth = c.req.header('Authorization');
    if (auth && auth.startsWith('Bearer ')) return next();

    // 3. Header khas aplikasi React
    if (c.req.header('X-Requested-With') === 'XMLHttpRequest') return next();

    // 4. Origin / Referer dari domain frontend resmi
    const allowed = allowedOrigins(c);
    const origin = extractHost(c.req.header('Origin')) || extractHost(c.req.header('Referer'));
    if (origin && allowed.has(origin)) return next();

    // Ditolak: kemungkinan curl/bot/scraper langsung
    return c.json(
      {
        status: 'fail',
        message: 'Akses langsung ke API tidak diizinkan. Gunakan aplikasi resmi SIPMB SMP YAPIA.',
      },
      403
    );
  };
}
