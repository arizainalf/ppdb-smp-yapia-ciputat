import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { app } from '../app.js';

dotenv.config();

const port = Number(process.env.PORT) || 8000;
console.log(`🚀 SIPMB Hono Backend Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
