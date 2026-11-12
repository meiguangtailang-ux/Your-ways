/**
 * 読む画面の状態のうち、次に開いたときにも残しておくもの。
 */
import type { ChapterLocation } from '@shared/bible';
import { DEFAULT_LOCATION } from '@/config/app';
import { createPersistentStore, useStore } from '@/lib/persistentStore';

interface ReaderPrefs {
  /** 最後に読んでいた箇所（「続きから」に使う） */
  lastRead: ChapterLocation;
  /** ふりがなを表示するか */
  showRuby: boolean;
}

const DEFAULTS: ReaderPrefs = { lastRead: DEFAULT_LOCATION, showRuby: true };

const store = createPersistentStore<ReaderPrefs>('reader.v1', DEFAULTS, (saved) => ({
  ...DEFAULTS,
  ...saved,
}));

export function useReaderPrefs(): ReaderPrefs {
  return useStore(store);
}

export function rememberLocation({ book, chapter }: ChapterLocation): void {
  store.update((prefs) =>
    prefs.lastRead.book === book && prefs.lastRead.chapter === chapter
      ? prefs
      : { ...prefs, lastRead: { book, chapter } },
  );
}

export function setShowRuby(showRuby: boolean): void {
  store.update((prefs) => ({ ...prefs, showRuby }));
}
