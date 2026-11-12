/**
 * 聖書本文の読み込み。書ごとの JSON を必要になったときに取りにいき、覚えておく。
 */
import { translation, type BookData, type BookId } from '@shared/bible';

const cache = new Map<BookId, Promise<BookData>>();

export function loadBook(bookId: BookId): Promise<BookData> {
  let pending = cache.get(bookId);
  if (!pending) {
    pending = fetchBook(bookId);
    cache.set(bookId, pending);
    // 失敗したら覚えず、次に開いたときに取り直せるようにする
    pending.catch(() => cache.delete(bookId));
  }
  return pending;
}

async function fetchBook(bookId: BookId): Promise<BookData> {
  const url = `${import.meta.env.BASE_URL}bible/${translation.id}/${bookId}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`本文を読み込めませんでした（${response.status}）`);
  return (await response.json()) as BookData;
}
