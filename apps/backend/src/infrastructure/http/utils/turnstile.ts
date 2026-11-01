// =====================================================================
// CLOUDFLARE TURNSTILE — validasi token manusia untuk endpoint publik berat
// ---------------------------------------------------------------------
// Cara aktifkan (opsional):
// 1. Buat widget Turnstile di Dashboard Cloudflare → Turnstile (Managed).
// 2. Set secret di Worker:  npx wrangler secret put TURNSTILE_SECRET_KEY
// 3. Endpoint yang memanggil verifyTurnstile akan OTOMATIS memvalidasi
//    bila secret tersedia (tanpa secret, validasi dilewati — aman untuk dev).
// 4. Frontend menambahkan widget + mengirim field `turnstileToken` pada body.
// =====================================================================

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const json: any = await res.json().catch(() => null);
    return Boolean(json?.success);
  } catch {
    // Gagal memanggil Turnstile → tolak (fail-closed) agar tidak jadi celah
    return false;
  }
}
