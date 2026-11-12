/** 画面のURL。リンクはここを通して作る */
import type { ChapterLocation } from '@shared/bible';

export const ROUTES = {
  search: '/search',
  journal: '/journal',
  bookmarks: '/bookmarks',
  settings: '/settings',
} as const;

/** 読む画面。verse を渡すと、その節までスクロールして知らせる */
export function readerPath(location: ChapterLocation, verse?: number): string {
  const path = `/read/${location.book}/${location.chapter}`;
  return verse ? `${path}?v=${verse}` : path;
}
