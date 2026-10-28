// =====================================================================
// Hashing kata sandi (PBKDF2-SHA256 via Web Crypto).
// Kompatibel Cloudflare Workers & Node.js (tanpa dependensi eksternal).
// Format tersimpan: pbkdf2$<iterations>$<saltHex>$<hashHex>
// =====================================================================
const PBKDF2_ITERATIONS = 100_000;
const KEY_BITS = 256;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// Perbandingan konstan-waktu untuk hash hex
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    key,
    KEY_BITS
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (stored.startsWith('pbkdf2$')) {
    const [, iterStr, saltHex, hashHex] = stored.split('$');
    const hash = await deriveBits(password, hexToBytes(saltHex), Number(iterStr) || PBKDF2_ITERATIONS);
    return { ok: safeEqualHex(toHex(hash), hashHex), needsRehash: false };
  }

  // Data lama masih plaintext (seed awal / versi sebelum hashing):
  // cocokkan lalu tandai untuk di-upgrade saat login.
  return { ok: stored === password, needsRehash: true };
}
