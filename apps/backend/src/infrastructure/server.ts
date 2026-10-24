import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createCalonSiswaRouter } from './http/routes/calonSiswaRoutes.js';
import { createAuthRouter } from './http/routes/authRoutes.js';
import { createGelombangRouter } from './http/routes/gelombangRoutes.js';
import { createUsersRouter } from './http/routes/usersRoutes.js';
import { createContentRouter } from './http/routes/contentRoutes.js';
import { createHelpdeskRouter } from './http/routes/helpdeskRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use('*', cors());

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

const port = Number(process.env.PORT) || 8000;
console.log(`🚀 SIPMB Hono Backend Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
