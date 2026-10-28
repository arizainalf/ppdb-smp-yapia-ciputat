// =====================================================================
// JWT HMAC-SHA256 via Web Crypto (kompatibel Cloudflare Workers & Node).
// Token: base64url(header).base64url(payload).base64url(HMAC)
// =====================================================================
import { UserRole } from '@yapia/shared';

const enc = new TextEncoder();

export interface JwtPayload {
  sub: string;
  role: UserRole;
  nama: string;
  iat: number;
  exp: number;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function signJwt(
  payload: { sub: string; role: UserRole; nama: string },
  secret: string,
  ttlSeconds: number = 12 * 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: JwtPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const header = bytesToB64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = bytesToB64url(enc.encode(JSON.stringify(full)));
  const signingInput = `${header}.${body}`;

  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(signingInput));
  return `${signingInput}.${bytesToB64url(new Uint8Array(sig))}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      b64urlToBytes(sig) as BufferSource,
      enc.encode(`${header}.${body}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as JwtPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}
