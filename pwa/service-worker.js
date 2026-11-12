/*
 * サービスワーカー：画面と聖書の本文を端末に覚えておき、電波が無くても読めるようにする。
 *
 * このファイルはひな形。ビルドのときに pwa/vitePlugin.ts が __…__ の部分を埋めて、
 * dist/sw.js として出力する。
 *
 * 覚えておくもの
 *   画面（HTML・JS・CSS）… 入れ直すたびに新しい版へ切り替える
 *   聖書の本文 ………………… 開いた書から順に。設定の「本文を保存する」で全巻まとめて
 *   文字（Web フォント）…… 使った分だけ
 * パウロ先生との通信（/api/）は覚えない。
 */
const SHELL_CACHE = 'shell-__SHELL_VERSION__';
const BIBLE_CACHE = 'bible-__BIBLE_VERSION__';
const FONT_CACHE = 'fonts-v1';

/** 最初にまとめて覚える、画面のファイル */
const SHELL_URLS = __SHELL_URLS__;

/** アプリが置かれている場所（サブディレクトリに置いても動くように、ここからの相対で判断する） */
const SCOPE_PATH = new URL('./', self.location.href).pathname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const current = new Set([SHELL_CACHE, BIBLE_CACHE, FONT_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => !current.has(name)).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE_PATH)) return;

  const path = url.pathname.slice(SCOPE_PATH.length);
  if (path.startsWith('api/')) return;

  if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else if (path.startsWith('bible/')) event.respondWith(cacheFirst(request, BIBLE_CACHE));
  else if (/\.woff2?$/.test(path)) event.respondWith(cacheFirst(request, FONT_CACHE));
  else event.respondWith(cacheFirst(request, SHELL_CACHE));
});

/** 覚えていればそれを返し、無ければ取りにいって覚える */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

/** 画面そのもの（HTML）は、つながるなら最新を取りにいき、つながらなければ覚えている版を出す */
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    return (await caches.match('./index.html')) ?? Response.error();
  }
}
