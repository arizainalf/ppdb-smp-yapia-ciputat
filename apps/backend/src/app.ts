import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createCalonSiswaRouter } from './infrastructure/http/routes/calonSiswaRoutes.js';
import { createAuthRouter } from './infrastructure/http/routes/authRoutes.js';
import { createGelombangRouter } from './infrastructure/http/routes/gelombangRoutes.js';
import { createUsersRouter } from './infrastructure/http/routes/usersRoutes.js';
import { createContentRouter } from './infrastructure/http/routes/contentRoutes.js';
import { createHelpdeskRouter } from './infrastructure/http/routes/helpdeskRoutes.js';
import { createPembayaranRouter } from './infrastructure/http/routes/pembayaranRoutes.js';
import { createPengaturanRouter } from './infrastructure/http/routes/pengaturanRoutes.js';
import { d1Client } from './infrastructure/database/d1Client.js';

export type Bindings = {
  DB: any;
  JWT_SECRET?: string;
};

export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();

  // Global Middlewares
  app.use('*', logger());
  app.use('*', cors());

  // Inject D1 Binding if running on Cloudflare Workers
  app.use('*', async (c, next) => {
    if (c.env && (c.env as any).DB) {
      d1Client.setBinding((c.env as any).DB);
    }
    await next();
  });

  // Health Check
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      service: 'SIPMB SMP YAPIA Ciputat API',
      architecture: 'Clean Architecture (Hono + Cloudflare D1)',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes Mounting
  app.route('/api/v1/auth', createAuthRouter());
  app.route('/api/v1/calon-siswa', createCalonSiswaRouter());
  app.route('/api/v1/gelombang', createGelombangRouter());
  app.route('/api/v1/users', createUsersRouter());
  app.route('/api/v1/content', createContentRouter());
  app.route('/api/v1/helpdesk', createHelpdeskRouter());
  app.route('/api/v1/pembayaran', createPembayaranRouter());
  app.route('/api/v1/pengaturan', createPengaturanRouter());

  return app;
}

export const app = createApp();
