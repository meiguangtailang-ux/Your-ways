/**
 * アプリの「外枠」を用意する Vite プラグイン。
 *
 * - index.html の %APP_NAME% などを、shared/appInfo.ts の値に置きかえる
 * - ホーム画面に追加するための設定（manifest.webmanifest）を出力する
 * - オフラインで読むためのサービスワーカー（sw.js）を、ひな形から出力する
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { APP_DESCRIPTION, APP_NAME, PAPER_COLOR, STORAGE_PREFIX } from '../shared/appInfo.ts';

/** index.html の中で %名前% と書くと置きかわる値 */
const HTML_VALUES: Record<string, string> = {
  APP_NAME,
  APP_DESCRIPTION,
  STORAGE_PREFIX,
  PAPER_LIGHT: PAPER_COLOR.light,
  PAPER_DARK: PAPER_COLOR.dark,
};

/** public/ に置いてある、最初から覚えておく画像 */
const STATIC_SHELL_FILES = ['favicon.svg', 'icons/icon-192.png'];

const MANIFEST_FILE = 'manifest.webmanifest';

const manifest = {
  name: APP_NAME,
  short_name: APP_NAME,
  description: APP_DESCRIPTION,
  lang: 'ja',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: PAPER_COLOR.light,
  theme_color: PAPER_COLOR.light,
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    {
      src: 'icons/icon-maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};

function hash(...parts: (string | Uint8Array)[]): string {
  const digest = createHash('sha256');
  for (const part of parts) digest.update(part);
  return digest.digest('hex').slice(0, 12);
}

/** 聖書の本文データの中身から決まる版。本文を作り直したときだけ変わる */
function hashDirectory(dir: string): string {
  const files = readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
  return hash(...files.flatMap((file) => [path.relative(dir, file), readFileSync(file)]));
}

/** Web フォントの定義（@font-face）だけが入った CSS か */
function isFontStyleSheet(output: { type: string; source?: string | Uint8Array }): boolean {
  return output.type === 'asset' && String(output.source).includes('@font-face');
}

export function appShell(): Plugin {
  let root = process.cwd();

  return {
    name: 'app-shell',
    // Vite が index.html を出力に加えた後で、覚えておくファイルの一覧を作りたい
    enforce: 'post',

    configResolved(config) {
      root = config.root;
    },

    transformIndexHtml(html) {
      return html.replace(
        /%(\w+)%/g,
        (placeholder, name: string) => HTML_VALUES[name] ?? placeholder,
      );
    },

    // 開発中は、manifest をその場で返す（サービスワーカーは本番のビルドでだけ使う）
    configureServer(server) {
      server.middlewares.use(`/${MANIFEST_FILE}`, (_request, response) => {
        response.setHeader('Content-Type', 'application/manifest+json');
        response.end(JSON.stringify(manifest));
      });
    },

    generateBundle(_options, bundle) {
      this.emitFile({
        type: 'asset',
        fileName: MANIFEST_FILE,
        source: JSON.stringify(manifest, null, 2),
      });

      // 画面を表示するのに要るファイル。
      // 文字（Web フォント）とその定義は、要る端末が限られ数も多いので、使った分だけ後から覚える
      const built = Object.entries(bundle)
        .filter(([file, output]) => !/\.woff2?$/.test(file) && !isFontStyleSheet(output))
        .map(([file]) => file);
      const shellFiles = [
        ...new Set(['index.html', ...built, MANIFEST_FILE, ...STATIC_SHELL_FILES]),
      ];
      const html = bundle['index.html'];
      const htmlSource = html?.type === 'asset' ? String(html.source) : '';

      const template = readFileSync(path.join(root, 'pwa/service-worker.js'), 'utf8');
      const source = template
        .replace('__SHELL_VERSION__', hash(JSON.stringify(shellFiles), htmlSource, template))
        .replace('__BIBLE_VERSION__', hashDirectory(path.join(root, 'public/bible')))
        .replace('__SHELL_URLS__', JSON.stringify(shellFiles.map((file) => `./${file}`)));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
