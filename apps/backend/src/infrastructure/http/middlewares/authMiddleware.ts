import { Context, Next } from 'hono';
import { UserRole, hasPermission, Permission } from '@yapia/shared';
import { verifyJwt } from '../../crypto/jwt.js';

export interface AuthContextVariables {
  userRole?: UserRole;
  userId?: string;
  userName?: string;
}

// Secret bersifat wajib di produksi; fallback dev hanya agar lokal tetap jalan.
function getJwtSecret(c: Context): string {
  const secret = ((c.env as any)?.JWT_SECRET as string | undefined) || process.env?.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️ [Auth] JWT_SECRET tidak diset — memakai secret development. WAJIB diset di produksi!');
    return 'sipmb-dev-secret-ganti-di-produksi';
  }
  return secret;
}

export function requireAuth() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          status: 'fail',
          message: 'Akses ditolak: Autentikasi diperlukan. Silakan login terlebih dahulu.',
        },
        401
      );
    }

    const payload = await verifyJwt(authHeader.replace('Bearer ', ''), getJwtSecret(c));
    if (!payload) {
      return c.json(
        {
          status: 'fail',
          message: 'Akses ditolak: Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.',
        },
        401
      );
    }

    c.set('userRole' as any, payload.role);
    c.set('userId' as any, payload.sub);
    c.set('userName' as any, payload.nama);

    await next();
  };
}

export function requirePermission(permission: Permission) {
  return async (c: Context, next: Next) => {
    const role = c.get('userRole' as any) as UserRole | undefined;

    if (!role || !hasPermission(role, permission)) {
      return c.json(
        {
          status: 'fail',
          message: `Akses ditolak (403 Forbidden): Peran '${role || 'ANONYMOUS'}' tidak memiliki hak akses '${permission}'.`,
        },
        403
      );
    }

    await next();
  };
}
