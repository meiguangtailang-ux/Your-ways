/**
 * 聖書の本文を、電波が無くても読めるように端末へ保存する。
 * ファイルを取りにいくと、サービスワーカー（pwa/service-worker.js）が端末に覚える。
 */
import { BOOK_IDS, translation, type SearchIndex } from '@shared/bible';
import { bookUrl } from '@/features/bible/loadBook';
import { loadSearchIndex, searchIndexUrl } from '@/features/search/searchIndex';
import { WEB_FONT_FAMILY, WEB_FONT_WEIGHTS } from '@/lib/webFont';

export interface SaveProgress {
  saved: number;
  total: number;
}

/** 保存する本文のファイル：66書と、検索用のデータ */
function dataUrls(): string[] {
  return [...BOOK_IDS.map(bookUrl), searchIndexUrl()];
}

/** いま端末に保存されている本文のファイルの数 */
export async function countSaved(): Promise<SaveProgress> {
  const urls = dataUrls();
  const found = await Promise.all(urls.map((url) => caches.match(url)));
  return { saved: found.filter(Boolean).length, total: urls.length };
}

/**
 * 画面を動かしているファイル（JS・CSS）。
 * 最初に開いたときはサービスワーカーがまだ動いておらず、覚えそこねた分があるので、取り直す。
 */
function loadedAssetUrls(): string[] {
  return performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.startsWith(location.origin) && /\/assets\/[^/]+\.(css|js)$/.test(url));
}

/**
 * Web フォントを使っている端末（明朝体が入っていない端末）では、聖書に出てくる文字の分の
 * フォントも取りにいく。端末の明朝体を使っているときは、何も取りにいかない。
 */
async function saveFonts(index: SearchIndex): Promise<void> {
  const bodyCharacters = new Set<string>();
  for (const { chapters } of index) {
    for (const verses of chapters) {
      for (const [, text] of verses) {
        for (const character of text) bodyCharacters.add(character);
      }
    }
  }
  const headingCharacters = new Set(
    `第章篇0123456789${translation.books.map((book) => book.name).join('')}`,
  );
  await Promise.all([
    document.fonts.load(
      `${WEB_FONT_WEIGHTS.body} 1em "${WEB_FONT_FAMILY}"`,
      [...bodyCharacters].join(''),
    ),
    document.fonts.load(
      `${WEB_FONT_WEIGHTS.heading} 1em "${WEB_FONT_FAMILY}"`,
      [...headingCharacters].join(''),
    ),
  ]);
}

/** すべて保存する。途中で失敗したら例外にする */
export async function saveAll(onProgress: (progress: SaveProgress) => void): Promise<void> {
  // サービスワーカーが動きはじめる前に取りにいくと、端末に覚えられない
  await navigator.serviceWorker.ready;

  const urls = dataUrls();
  let saved = 0;
  for (const url of [...urls, ...loadedAssetUrls()]) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`保存できませんでした: ${url}`);
    await response.arrayBuffer();
    onProgress({ saved: Math.min(++saved, urls.length), total: urls.length });
  }
  await saveFonts(await loadSearchIndex());

  if ((await countSaved()).saved < urls.length) throw new Error('端末に保存されませんでした');
}
