/**
 * しおり。章にはさむもの（verse なし）と、特定の節にはさむもの（verse あり）がある。
 */
import type { ChapterLocation } from '@shared/bible';
import { nowIso } from '@/lib/date';
import { createPersistentStore, useStore } from '@/lib/persistentStore';

export interface Bookmark extends ChapterLocation {
  id: string;
  verse?: number;
  /** はさんだ箇所の書き出し（一覧で見分けるため） */
  preview: string;
  createdAt: string;
}

const store = createPersistentStore<Bookmark[]>('bookmarks.v1', []);

/** すべてのしおり（新しい順） */
export function useBookmarks(): Bookmark[] {
  return useStore(store);
}

export function findBookmark(
  bookmarks: readonly Bookmark[],
  location: ChapterLocation,
  verse?: number,
): Bookmark | undefined {
  return bookmarks.find(
    (bookmark) =>
      bookmark.book === location.book &&
      bookmark.chapter === location.chapter &&
      bookmark.verse === verse,
  );
}

/** その章で、しおりがはさまれている節 */
export function versesWithBookmarks(
  bookmarks: readonly Bookmark[],
  location: ChapterLocation,
): Set<number> {
  const verses = new Set<number>();
  for (const bookmark of bookmarks) {
    if (
      bookmark.book === location.book &&
      bookmark.chapter === location.chapter &&
      bookmark.verse !== undefined
    ) {
      verses.add(bookmark.verse);
    }
  }
  return verses;
}

export function addBookmark(draft: Omit<Bookmark, 'id' | 'createdAt'>): void {
  store.update((bookmarks) => {
    if (findBookmark(bookmarks, draft, draft.verse)) return bookmarks;
    return [{ ...draft, id: crypto.randomUUID(), createdAt: nowIso() }, ...bookmarks];
  });
}

export function removeBookmark(id: string): void {
  store.update((bookmarks) => bookmarks.filter((bookmark) => bookmark.id !== id));
}
