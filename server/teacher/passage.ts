/**
 * 先生に渡す聖書本文を、サーバー側のデータから読む。
 * 画面から本文そのものは受け取らない（箇所の指定だけ受け取り、本文はここで用意する）。
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { BookId } from '../../shared/bible/canon';
import { kougo } from '../../shared/bible/translations/kougo';
import type { BookData, ChapterData } from '../../shared/bible/types';
import { config } from '../config';

const cache = new Map<BookId, Promise<BookData>>();

async function readBook(bookId: BookId): Promise<BookData> {
  for (const dir of config.bibleDirs) {
    try {
      const json = await readFile(path.join(dir, kougo.id, `${bookId}.json`), 'utf8');
      return JSON.parse(json) as BookData;
    } catch {
      // 次の置き場所を試す
    }
  }
  throw new Error(`聖書本文が見つかりません: ${bookId}`);
}

/** 指定した章の本文。章が存在しなければ undefined */
export async function loadChapter(
  bookId: BookId,
  chapter: number,
): Promise<ChapterData | undefined> {
  let pending = cache.get(bookId);
  if (!pending) {
    pending = readBook(bookId);
    cache.set(bookId, pending);
    pending.catch(() => cache.delete(bookId));
  }
  return (await pending).chapters[chapter - 1];
}
