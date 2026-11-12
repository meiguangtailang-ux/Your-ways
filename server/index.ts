import { serve } from '@hono/node-server';
import { createApp } from './app';
import { config } from './config';

serve({ fetch: createApp().fetch, port: config.port }, ({ port }) => {
  console.log(`サーバーを起動しました: http://localhost:${port}`);
});
