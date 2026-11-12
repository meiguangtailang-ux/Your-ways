import { existsSync } from 'node:fs';
import path from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { TEACHER_API_PATH } from '../shared/teacher/contract';
import { config } from './config';
import { teacherRoute } from './teacher/route';

export function createApp(): Hono {
  const app = new Hono();

  if (config.corsOrigin) app.use('/api/*', cors({ origin: config.corsOrigin }));
  app.route(TEACHER_API_PATH, teacherRoute);

  // ビルド済みの画面があれば、同じサーバーから配信する（開発中は Vite が配信する）
  if (existsSync(config.distDir)) {
    app.use('*', serveStatic({ root: path.relative(process.cwd(), config.distDir) || '.' }));
  }

  return app;
}
