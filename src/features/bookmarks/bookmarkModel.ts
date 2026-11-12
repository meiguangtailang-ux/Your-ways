/**
 * しおりのデータの形と、その計算。
 * 保存や画面とのつなぎは bookmarkStore.ts にある。
 */
import { isChapterLocation, translation, type ChapterLocation } from '@shared/bible';

/** 章にはさむもの（verse なし）と、特定の節にはさむもの（verse あり）がある */
export interface Bookmark extends ChapterLocation {
  id: string;
  verse?: number;
  /** はさんだ箇所の書き出し（一覧で見分けるため） */
  preview: string;
  createdAt: string;
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

/** 外から来たデータ（バックアップ）が、しおりとして正しい形かを確かめる */
export function isBookmark(value: unknown): value is Bookmark {
  if (!isChapterLocation(translation, value)) return false;
  const bookmark = value as unknown as Record<string, unknown>;
  return (
    typeof bookmark.id === 'string' &&
    typeof bookmark.preview === 'string' &&
    typeof bookmark.createdAt === 'string' &&
    (bookmark.verse === undefined ||
      (Number.isInteger(bookmark.verse) && (bookmark.verse as number) > 0))
  );
}
