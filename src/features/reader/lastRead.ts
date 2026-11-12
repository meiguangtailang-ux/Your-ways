/**
 * 最後に読んでいた箇所。次に開いたとき、ここから始める。
 */
import type { ChapterLocation } from '@shared/bible';
import { DEFAULT_LOCATION } from '@/config/app';
import { createPersistentStore, useStore } from '@/lib/persistentStore';

interface ReaderPrefs {
  lastRead: ChapterLocation;
}

const DEFAULTS: ReaderPrefs = { lastRead: DEFAULT_LOCATION };

const store = createPersistentStore<ReaderPrefs>('reader.v1', DEFAULTS, (saved) => ({
  lastRead: saved.lastRead ?? DEFAULTS.lastRead,
}));

export function useLastRead(): ChapterLocation {
  return useStore(store).lastRead;
}

export function rememberLocation({ book, chapter }: ChapterLocation): void {
  store.update((prefs) =>
    prefs.lastRead.book === book && prefs.lastRead.chapter === chapter
      ? prefs
      : { lastRead: { book, chapter } },
  );
}
