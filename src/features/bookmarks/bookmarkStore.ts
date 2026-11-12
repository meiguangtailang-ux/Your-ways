/**
 * しおりの保存と、画面からの読み書き。
 */
import { nowIso } from '@/lib/date';
import { mergeById, newestFirst } from '@/lib/mergeById';
import { createPersistentStore, useStore } from '@/lib/persistentStore';
import { findBookmark, type Bookmark } from './bookmarkModel';

const store = createPersistentStore<Bookmark[]>('bookmarks.v1', []);

/** すべてのしおり（新しい順） */
export function useBookmarks(): Bookmark[] {
  return useStore(store);
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

/** バックアップ用：すべてのしおり */
export function exportBookmarks(): Bookmark[] {
  return store.get();
}

/** バックアップからしおりを足す。同じ箇所のしおりが既にあれば足さない。戻り値は足された件数 */
export function importBookmarks(incoming: readonly Bookmark[]): number {
  const current = store.get();
  const fresh = incoming.filter((bookmark) => !findBookmark(current, bookmark, bookmark.verse));
  const { merged, added } = mergeById(current, fresh);
  if (added > 0) store.update(() => newestFirst(merged));
  return added;
}
