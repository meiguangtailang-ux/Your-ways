/**
 * サービスワーカー（pwa/service-worker.js）の登録。
 * 本番のビルドでだけ使う。開発中は、古い画面が残って混乱するので登録しない。
 */
export function isOfflineSupported(): boolean {
  return import.meta.env.PROD && 'serviceWorker' in navigator && 'caches' in window;
}

export function registerServiceWorker(): void {
  if (!isOfflineSupported()) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // 登録できなくても、オンラインではそのまま使える
    });
  });
}
