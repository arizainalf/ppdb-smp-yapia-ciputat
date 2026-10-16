import { Context, Next } from 'hono';
import { UserRole, hasPermission, Permission } from '@yapia/shared';

export interface AuthContextVariables {
  userRole?: UserRole;
  userId?: string;
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

    const token = authHeader.replace('Bearer ', '');
    // In demo environment, token format: mock-jwt-token-{userId}-{timestamp} or demo-token-{role}
    let role: UserRole = 'ADMIN';

    if (token.includes('OPERATOR') || token.includes('usr-operator') || token.includes('usr-tu')) {
      role = 'OPERATOR';
    } else if (token.includes('KEPSEK') || token.includes('usr-kepsek')) {
      role = 'KEPSEK';
    } else if (token.includes('BENDAHARA') || token.includes('usr-bendahara')) {
      role = 'BENDAHARA';
    } else if (token.includes('PENDAFTAR')) {
      role = 'PENDAFTAR';
    }

    c.set('userRole' as any, role);
    c.set('userId' as any, 'active-user-id');

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
