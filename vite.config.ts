import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { appShell } from './pwa/vitePlugin';

const API_ORIGIN = `http://localhost:${process.env.PORT ?? 8787}`;

export default defineConfig({
  // 相対パスで出力し、サブディレクトリ配下（GitHub Pages など）でも動くようにする
  base: './',
  plugins: [react(), appShell()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  server: {
    proxy: { '/api': API_ORIGIN },
  },
  test: {
    include: ['{src,shared,server}/**/*.test.ts'],
  },
});
