/** 画面のURL。リンクはここを通して作る */
import type { ChapterLocation } from '@shared/bible';

export const ROUTES = {
  journal: '/journal',
  bookmarks: '/bookmarks',
} as const;

/** 読む画面。verse を渡すと、その節までスクロールして知らせる */
export function readerPath(location: ChapterLocation, verse?: number): string {
  const path = `/read/${location.book}/${location.chapter}`;
  return verse ? `${path}?v=${verse}` : path;
}
