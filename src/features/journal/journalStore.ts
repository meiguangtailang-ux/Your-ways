/**
 * メモと祈り。節に結びついたもの（ref あり）と、節に結びつかない祈り（ref なし）がある。
 */
import type { ChapterLocation, PassageRef } from '@shared/bible';
import { nowIso } from '@/lib/date';
import { createPersistentStore, useStore } from '@/lib/persistentStore';

export type EntryKind = 'note' | 'prayer';

export interface JournalEntry {
  id: string;
  kind: EntryKind;
  /** 結びついている聖書箇所。無ければ、どの節にも結びつかない記録 */
  ref?: PassageRef;
  /** 書いた時点の本文の写し（一覧で本文を読み込まずに見せるため） */
  quote?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const ENTRY_KIND_LABEL: Record<EntryKind, string> = {
  note: 'メモ',
  prayer: '祈り',
};

const store = createPersistentStore<JournalEntry[]>('journal.v1', []);

/** すべての記録（新しい順） */
export function useJournal(): JournalEntry[] {
  return useStore(store);
}

export function addEntry(draft: Pick<JournalEntry, 'kind' | 'ref' | 'quote' | 'body'>): void {
  const now = nowIso();
  const entry: JournalEntry = { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  store.update((entries) => [entry, ...entries]);
}

export function updateEntry(id: string, body: string): void {
  store.update((entries) =>
    entries.map((entry) => (entry.id === id ? { ...entry, body, updatedAt: nowIso() } : entry)),
  );
}

export function deleteEntry(id: string): void {
  store.update((entries) => entries.filter((entry) => entry.id !== id));
}

function isInChapter(entry: JournalEntry, location: ChapterLocation): boolean {
  return entry.ref?.book === location.book && entry.ref.chapter === location.chapter;
}

/** その章で、メモや祈りが付いている節 */
export function versesWithEntries(
  entries: readonly JournalEntry[],
  location: ChapterLocation,
): Set<number> {
  const verses = new Set<number>();
  for (const entry of entries) {
    if (isInChapter(entry, location)) entry.ref?.verses.forEach((verse) => verses.add(verse));
  }
  return verses;
}

/** 指定した節のどれかに結びついている記録 */
export function entriesForVerses(
  entries: readonly JournalEntry[],
  location: ChapterLocation,
  verses: readonly number[],
): JournalEntry[] {
  return entries.filter(
    (entry) =>
      isInChapter(entry, location) && entry.ref!.verses.some((verse) => verses.includes(verse)),
  );
}
